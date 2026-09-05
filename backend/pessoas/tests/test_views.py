"""Testes da API REST do app pessoas."""

from rest_framework import status
from rest_framework.test import APIClient

from pessoas.models import Cliente, Vendedor


def test_lista_clientes(client: APIClient, cliente: Cliente) -> None:
    """GET /api/clientes/ retorna os clientes cadastrados."""
    resposta = client.get("/api/clientes/")

    assert resposta.status_code == status.HTTP_200_OK
    assert resposta.data[0]["nome"] == cliente.nome


def test_cria_cliente_valido(client: APIClient, db) -> None:
    """POST /api/clientes/ com dados válidos cria o cliente."""
    dados = {
        "nome": "Carlos Souza",
        "email": "carlos@example.com",
        "telefone": "11966666666",
    }

    resposta = client.post("/api/clientes/", dados)

    assert resposta.status_code == status.HTTP_201_CREATED
    assert Cliente.objects.filter(email="carlos@example.com").exists()


def test_lista_vendedores(client: APIClient, vendedor: Vendedor) -> None:
    """GET /api/vendedores/ retorna os vendedores cadastrados."""
    resposta = client.get("/api/vendedores/")

    assert resposta.status_code == status.HTTP_200_OK
    assert resposta.data[0]["nome"] == vendedor.nome


def test_cria_vendedor_valido(client: APIClient, db) -> None:
    """POST /api/vendedores/ com dados válidos cria o vendedor."""
    dados = {
        "nome": "Paula Lima",
        "email": "paula@example.com",
        "telefone": "11955555555",
    }

    resposta = client.post("/api/vendedores/", dados)

    assert resposta.status_code == status.HTTP_201_CREATED
    assert Vendedor.objects.filter(email="paula@example.com").exists()
