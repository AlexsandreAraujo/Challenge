"""Serviços de cálculo de comissão."""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from pessoas.models import Vendedor
from vendas.models import ItemVenda, Venda

from .models import FaixaComissaoDia


@dataclass
class ComissaoVendedor:
    """Quantidade de vendas e total de comissão a pagar a um vendedor num período."""

    vendedor: Vendedor
    total_vendas: int
    total: Decimal


def calcular_percentual_efetivo(
    percentual_produto: Decimal, faixa: FaixaComissaoDia | None
) -> Decimal:
    """Aplica o limite min/max da faixa do dia ao percentual do produto."""
    if faixa is None:
        return percentual_produto
    return max(faixa.comissao_minima, min(percentual_produto, faixa.comissao_maxima))


def obter_percentual_efetivo_item(item: ItemVenda) -> Decimal:
    """Determina o percentual de comissão efetivo do item, aplicando a faixa do dia."""
    dia_semana = item.venda.data_hora.weekday()
    faixa = FaixaComissaoDia.objects.filter(dia_semana=dia_semana).first()
    return calcular_percentual_efetivo(item.produto.percentual_comissao, faixa)


def calcular_comissao_item(item: ItemVenda) -> Decimal:
    """Calcula a comissão de um item, aplicando a faixa do dia da venda."""
    percentual = obter_percentual_efetivo_item(item)
    return item.subtotal * percentual / Decimal("100")


def calcular_comissao_venda(venda: Venda) -> Decimal:
    """Soma a comissão de todos os itens de uma venda."""
    return sum(
        (calcular_comissao_item(item) for item in venda.itens.all()), Decimal("0")
    )


def calcular_comissoes_por_vendedor(
    data_inicio: date, data_fim: date
) -> list[ComissaoVendedor]:
    """Calcula quantidade de vendas e total de comissão de cada vendedor no período."""
    vendas = (
        Venda.objects.filter(
            data_hora__date__gte=data_inicio, data_hora__date__lte=data_fim
        )
        .select_related("vendedor")
        .prefetch_related("itens__produto")
    )

    quantidade_vendas: dict[Vendedor, int] = {}
    totais_comissao: dict[Vendedor, Decimal] = {}
    for venda in vendas:
        quantidade_vendas.setdefault(venda.vendedor, 0)
        totais_comissao.setdefault(venda.vendedor, Decimal("0"))
        quantidade_vendas[venda.vendedor] += 1
        totais_comissao[venda.vendedor] += calcular_comissao_venda(venda)

    resultado = [
        ComissaoVendedor(
            vendedor=vendedor,
            total_vendas=quantidade_vendas[vendedor],
            total=totais_comissao[vendedor],
        )
        for vendedor in quantidade_vendas
    ]
    return sorted(resultado, key=lambda c: c.vendedor.nome)
