"""Modelos do domínio de vendas."""

from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from catalogo.models import Produto
from pessoas.models import Cliente, Vendedor


class Venda(models.Model):
    """Venda de um ou mais produtos para um cliente, feita por um vendedor."""

    @property
    def numero_nota_fiscal(self) -> str:
        """Número da nota fiscal, derivado sequencialmente do ID da venda."""
        return f"{self.id:08d}"

    data_hora = models.DateTimeField()
    cliente = models.ForeignKey(
        Cliente, on_delete=models.PROTECT, related_name="vendas"
    )
    vendedor = models.ForeignKey(
        Vendedor, on_delete=models.PROTECT, related_name="vendas"
    )

    def __str__(self) -> str:
        """Retorna a nota fiscal como representação textual."""
        return self.numero_nota_fiscal

    @property
    def valor_total(self) -> Decimal:
        """Soma os subtotais de todos os itens da venda."""
        return sum((item.subtotal for item in self.itens.all()), Decimal("0"))


class ItemVenda(models.Model):
    """Um produto e sua quantidade dentro de uma venda."""

    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, related_name="itens")
    produto = models.ForeignKey(
        Produto, on_delete=models.PROTECT, related_name="itens_venda"
    )
    quantidade = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    def __str__(self) -> str:
        """Retorna produto e quantidade como representação textual."""
        return f"{self.produto.codigo} x{self.quantidade}"

    @property
    def subtotal(self) -> Decimal:
        """Calcula quantidade multiplicada pelo valor unitário do produto."""
        return self.quantidade * self.produto.valor_unitario
