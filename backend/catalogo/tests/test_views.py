"""Testes da API REST do app catalogo."""

from rest_framework import status
from rest_framework.test import APIClient

from catalogo.models import Produto


def test_lista_produtos(client: APIClient, produto: Produto) -> None:
    """GET /api/produtos/ retorna os produtos cadastrados."""
    resposta = client.get("/api/produtos/")

    assert resposta.status_code == status.HTTP_200_OK
    assert resposta.data[0]["codigo"] == produto.codigo


def test_cria_produto_valido(client: APIClient, db) -> None:
    """POST /api/produtos/ com dados válidos cria o produto."""
    dados = {
        "codigo": "P099",
        "descricao": "Lapis",
        "valor_unitario": "2.50",
        "percentual_comissao": "5.00",
    }

    resposta = client.post("/api/produtos/", dados)

    assert resposta.status_code == status.HTTP_201_CREATED
    assert Produto.objects.filter(codigo="P099").exists()


def test_cria_produto_com_comissao_invalida_retorna_400(client: APIClient, db) -> None:
    """POST /api/produtos/ com comissão fora do intervalo retorna 400."""
    dados = {
        "codigo": "P098",
        "descricao": "Caneta",
        "valor_unitario": "2.50",
        "percentual_comissao": "15.00",
    }

    resposta = client.post("/api/produtos/", dados)

    assert resposta.status_code == status.HTTP_400_BAD_REQUEST
    assert "percentual_comissao" in resposta.data


def test_atualiza_produto(client: APIClient, produto: Produto) -> None:
    """PATCH /api/produtos/<id>/ atualiza parcialmente o produto."""
    resposta = client.patch(
        f"/api/produtos/{produto.id}/", {"descricao": "Caderno grande"}
    )

    assert resposta.status_code == status.HTTP_200_OK
    produto.refresh_from_db()
    assert produto.descricao == "Caderno grande"


def test_exclui_produto(client: APIClient, produto: Produto) -> None:
    """DELETE /api/produtos/<id>/ remove o produto."""
    resposta = client.delete(f"/api/produtos/{produto.id}/")

    assert resposta.status_code == status.HTTP_204_NO_CONTENT
    assert not Produto.objects.filter(id=produto.id).exists()
