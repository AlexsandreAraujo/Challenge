"""Serviços de cálculo de comissão."""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from pessoas.models import Vendedor
from vendas.models import ItemVenda, Venda

from .models import FaixaComissaoDia


@dataclass
class ComissaoVendedor:
    """Total de comissão a pagar a um vendedor num período."""

    vendedor: Vendedor
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
    """Calcula o total de comissão de cada vendedor com vendas no período."""
    vendas = (
        Venda.objects.filter(
            data_hora__date__gte=data_inicio, data_hora__date__lte=data_fim
        )
        .select_related("vendedor")
        .prefetch_related("itens__produto")
    )

    totais: dict[Vendedor, Decimal] = {}
    for venda in vendas:
        totais.setdefault(venda.vendedor, Decimal("0"))
        totais[venda.vendedor] += calcular_comissao_venda(venda)

    resultado = [
        ComissaoVendedor(vendedor=vendedor, total=total)
        for vendedor, total in totais.items()
    ]
    return sorted(resultado, key=lambda c: c.vendedor.nome)
