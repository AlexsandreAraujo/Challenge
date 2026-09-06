"""Modelos do domínio de pessoas (clientes e vendedores)."""

from django.db import models


class Pessoa(models.Model):
    """Campos comuns a clientes e vendedores."""

    nome = models.CharField(max_length=150)
    email = models.EmailField()
    telefone = models.CharField(max_length=20)

    class Meta:
        """Impede a criação de tabela para este model — apenas fornece campos."""

        abstract = True

    def __str__(self) -> str:
        """Retorna o nome como representação textual."""
        return self.nome


class Cliente(Pessoa):
    """Cliente que realiza compras na papelaria."""


class Vendedor(Pessoa):
    """Vendedor responsável por registrar as vendas."""

    @property
    def codigo(self) -> str:
        """Código sequencial do vendedor, derivado do ID."""
        return f"{self.id:03d}"
