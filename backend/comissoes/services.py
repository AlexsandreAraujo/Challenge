"""Serviços de cálculo de comissão."""

from decimal import Decimal

from vendas.models import ItemVenda, Venda

from .models import FaixaComissaoDia


def calcular_percentual_efetivo(
    percentual_produto: Decimal, faixa: FaixaComissaoDia | None
) -> Decimal:
    """Aplica o limite min/max da faixa do dia ao percentual do produto."""
    if faixa is None:
        return percentual_produto
    return max(faixa.comissao_minima, min(percentual_produto, faixa.comissao_maxima))


def calcular_comissao_item(item: ItemVenda) -> Decimal:
    """Calcula a comissão de um item, aplicando a faixa do dia da venda."""
    dia_semana = item.venda.data_hora.weekday()
    faixa = FaixaComissaoDia.objects.filter(dia_semana=dia_semana).first()
    percentual = calcular_percentual_efetivo(item.produto.percentual_comissao, faixa)
    return item.subtotal * percentual / Decimal("100")


def calcular_comissao_venda(venda: Venda) -> Decimal:
    """Soma a comissão de todos os itens de uma venda."""
    return sum(
        (calcular_comissao_item(item) for item in venda.itens.all()), Decimal("0")
    )
