"""Testes do serviço de cálculo de comissão."""

from decimal import Decimal

from comissoes.models import FaixaComissaoDia
from comissoes.services import calcular_percentual_efetivo


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
