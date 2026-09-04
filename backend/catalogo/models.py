"""Modelos do domínio de catálogo."""

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Produto(models.Model):
    """Modelos do domínio de catálogo (produtos)."""

    codigo = models.CharField(max_length=10, unique=True)
    descricao = models.CharField(max_length=200)
    valor_unitario = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    percentual_comissao = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
