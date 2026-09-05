"""Testes do serviço de cálculo de comissão."""

from datetime import datetime
from decimal import Decimal

from django.utils.timezone import make_aware

from catalogo.models import Produto
from comissoes.models import FaixaComissaoDia
from comissoes.services import (
    calcular_comissao_item,
    calcular_comissao_venda,
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
        numero_nota_fiscal="NF001",
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
        numero_nota_fiscal="NF002",
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
        numero_nota_fiscal="NF003",
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
