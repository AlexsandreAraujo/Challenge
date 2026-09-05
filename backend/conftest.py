"""Fixtures compartilhadas entre os testes de todos os apps."""

from decimal import Decimal
from typing import TYPE_CHECKING

import pytest

from catalogo.models import Produto
from pessoas.models import Cliente, Vendedor

if TYPE_CHECKING:
    from rest_framework.test import APIClient


@pytest.fixture
def cliente(db) -> Cliente:
    """Cliente de exemplo para uso em testes."""
    return Cliente.objects.create(
        nome="Ana Souza", email="ana@example.com", telefone="11999999999"
    )


@pytest.fixture
def vendedor(db) -> Vendedor:
    """Vendedor de exemplo para uso em testes."""
    return Vendedor.objects.create(
        nome="João Silva", email="joao@example.com", telefone="11988888888"
    )


@pytest.fixture
def produto(db) -> Produto:
    """Produto de exemplo, com 10% de comissão, para uso em testes."""
    return Produto.objects.create(
        codigo="P001",
        descricao="Caderno",
        valor_unitario=Decimal("10.00"),
        percentual_comissao=Decimal("10.00"),
    )


@pytest.fixture
def client() -> "APIClient":
    """Cliente de teste da API REST (sobrescreve o client padrão do Django)."""
    from rest_framework.test import APIClient

    return APIClient()
