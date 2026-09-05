"""Modelos do domínio de comissões."""

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class DiaSemana(models.IntegerChoices):
    """Dias da semana, alinhados ao retorno de `datetime.date.weekday()`."""

    SEGUNDA = 0, "Segunda-feira"
    TERCA = 1, "Terça-feira"
    QUARTA = 2, "Quarta-feira"
    QUINTA = 3, "Quinta-feira"
    SEXTA = 4, "Sexta-feira"
    SABADO = 5, "Sábado"
    DOMINGO = 6, "Domingo"


class FaixaComissaoDia(models.Model):
    """Faixa mínima/máxima de comissão aplicável num dia da semana."""

    dia_semana = models.IntegerField(choices=DiaSemana.choices, unique=True)
    comissao_minima = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
    comissao_maxima = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )

    def __str__(self) -> str:
        """Retorna o dia da semana e a faixa configurada."""
        dia = self.get_dia_semana_display()
        return f"{dia}: {self.comissao_minima}% - {self.comissao_maxima}%"

    def clean(self) -> None:
        """Garante que a comissão mínima não seja maior que a máxima."""
        if self.comissao_minima > self.comissao_maxima:
            raise ValidationError("A comissão mínima não pode ser maior que a máxima.")
