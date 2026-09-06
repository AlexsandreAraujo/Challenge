"""Testes do serviço de cálculo de comissão."""

from datetime import date, datetime
from decimal import Decimal

from django.utils.timezone import make_aware

from catalogo.models import Produto
from comissoes.models import FaixaComissaoDia
from comissoes.services import (
    calcular_comissao_item,
    calcular_comissao_venda,
    calcular_comissoes_por_vendedor,
    calcular_percentual_efetivo,
)
from pessoas.models import Cliente, Vendedor
from vendas.models import ItemVenda, Venda


def test_sem_faixa_usa_percentual_do_produto() -> None:
    """Sem faixa configurada para o dia, o percentual do produto não muda."""
    resultado = calcular_percentual_efetivo(Decimal("7.00"), None)
    assert resultado == Decimal("7.00")


def test_percentual_acima_do_maximo_e_limitado() -> None:
    """Percentual acima do máximo da faixa é reduzido ao teto configurado."""
    faixa = FaixaComissaoDia(
        comissao_minima=Decimal("3.00"), comissao_maxima=Decimal("5.00")
    )
    resultado = calcular_percentual_efetivo(Decimal("10.00"), faixa)
    assert resultado == Decimal("5.00")


def test_percentual_abaixo_do_minimo_e_elevado() -> None:
    """Percentual abaixo do mínimo da faixa é elevado ao piso configurado."""
    faixa = FaixaComissaoDia(
        comissao_minima=Decimal("3.00"), comissao_maxima=Decimal("5.00")
    )
    resultado = calcular_percentual_efetivo(Decimal("2.00"), faixa)
    assert resultado == Decimal("3.00")


def test_percentual_dentro_da_faixa_nao_muda() -> None:
    """Percentual já dentro da faixa permanece igual."""
    faixa = FaixaComissaoDia(
        comissao_minima=Decimal("3.00"), comissao_maxima=Decimal("5.00")
    )
    resultado = calcular_percentual_efetivo(Decimal("4.00"), faixa)
    assert resultado == Decimal("4.00")


def test_item_sem_faixa_usa_percentual_do_produto(
    cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """Sem FaixaComissaoDia para o dia, a comissão usa o percentual do produto."""
    venda = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),  # quarta-feira, sem faixa
        cliente=cliente,
        vendedor=vendedor,
    )
    item = ItemVenda.objects.create(venda=venda, produto=produto, quantidade=2)

    resultado = calcular_comissao_item(item)

    # subtotal = 2 * 10.00 = 20.00; comissao = 10% de 20.00 = 2.00
    assert resultado == Decimal("2.00")


def test_item_com_faixa_aplica_o_limite_maximo(
    cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """Com FaixaComissaoDia para o dia, a comissão respeita o limite configurado."""
    FaixaComissaoDia.objects.create(
        dia_semana=0,  # segunda-feira
        comissao_minima=Decimal("3.00"),
        comissao_maxima=Decimal("5.00"),
    )
    venda = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 7)),  # segunda-feira
        cliente=cliente,
        vendedor=vendedor,
    )
    item = ItemVenda.objects.create(venda=venda, produto=produto, quantidade=2)

    resultado = calcular_comissao_item(item)

    # produto tem 10% de comissão, mas a segunda-feira limita a 5%
    # subtotal = 20.00; comissao = 5% de 20.00 = 1.00
    assert resultado == Decimal("1.00")


def test_comissao_da_venda_soma_todos_os_itens(
    cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """A comissão da venda é a soma da comissão de cada item."""
    outro_produto = Produto.objects.create(
        codigo="P002",
        descricao="Caneta",
        valor_unitario=Decimal("5.00"),
        percentual_comissao=Decimal("4.00"),
    )
    venda = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),  # quarta-feira, sem faixa
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(venda=venda, produto=produto, quantidade=2)
    ItemVenda.objects.create(venda=venda, produto=outro_produto, quantidade=3)

    resultado = calcular_comissao_venda(venda)

    # item 1: subtotal 20.00, comissao 10% = 2.00
    # item 2: subtotal 15.00, comissao 4% = 0.60
    # total = 2.60
    assert resultado == Decimal("2.60")


def test_calcula_comissoes_por_vendedor_agrupando_e_somando(
    cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """Soma a comissão de todas as vendas de cada vendedor no período."""
    outro_vendedor = Vendedor.objects.create(
        nome="Bruno Lima", email="bruno@example.com", telefone="11977777777"
    )

    venda1 = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(
        venda=venda1, produto=produto, quantidade=1
    )  # comissao 1.00

    venda2 = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 10)),
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(
        venda=venda2, produto=produto, quantidade=1
    )  # comissao 1.00

    venda3 = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=outro_vendedor,
    )
    ItemVenda.objects.create(
        venda=venda3, produto=produto, quantidade=2
    )  # comissao 2.00

    resultado = calcular_comissoes_por_vendedor(date(2026, 9, 1), date(2026, 9, 30))

    assert len(resultado) == 2
    # ordenado por nome: "Bruno Lima" vem antes de "João Silva"
    assert resultado[0].vendedor == outro_vendedor
    assert resultado[0].total == Decimal("2.00")
    assert resultado[1].vendedor == vendedor
    assert resultado[1].total == Decimal("2.00")  # 1.00 + 1.00 das duas vendas


def test_exclui_vendas_fora_do_periodo(
    cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """Vendas fora do período informado não entram no total."""
    venda_dentro = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(venda=venda_dentro, produto=produto, quantidade=1)

    venda_fora = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 10, 1)),
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(venda=venda_fora, produto=produto, quantidade=5)

    resultado = calcular_comissoes_por_vendedor(date(2026, 9, 1), date(2026, 9, 30))

    assert len(resultado) == 1
    assert resultado[0].total == Decimal("1.00")


def test_total_vendas_soma_valor_das_vendas_do_vendedor(
    cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """total_vendas soma o valor_total das vendas do vendedor no período."""
    venda1 = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(venda=venda1, produto=produto, quantidade=2)

    venda2 = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 10)),
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(venda=venda2, produto=produto, quantidade=1)

    resultado = calcular_comissoes_por_vendedor(date(2026, 9, 1), date(2026, 9, 30))

    assert resultado[0].total_vendas == Decimal("30.00")
