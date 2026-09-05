"""Testes da API REST do endpoint de comissões por vendedor."""

from datetime import datetime

from django.utils.timezone import make_aware
from rest_framework import status
from rest_framework.test import APIClient

from catalogo.models import Produto
from pessoas.models import Cliente, Vendedor
from vendas.models import ItemVenda, Venda


def test_endpoint_retorna_comissao_do_vendedor_no_periodo(
    client: APIClient, cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """GET /api/comissoes/ retorna o total de comissão do vendedor no período."""
    venda = Venda.objects.create(
        numero_nota_fiscal="NF200",
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(venda=venda, produto=produto, quantidade=2)

    resposta = client.get(
        "/api/comissoes/", {"data_inicio": "2026-09-01", "data_fim": "2026-09-30"}
    )

    assert resposta.status_code == status.HTTP_200_OK
    assert len(resposta.data) == 1
    assert resposta.data[0]["vendedor"]["nome"] == vendedor.nome
    assert resposta.data[0]["total"] == "2.00"


def test_endpoint_com_data_invalida_retorna_400(client: APIClient, db) -> None:
    """GET /api/comissoes/ com data mal formatada retorna 400."""
    resposta = client.get(
        "/api/comissoes/", {"data_inicio": "texto-invalido", "data_fim": "2026-09-30"}
    )

    assert resposta.status_code == status.HTTP_400_BAD_REQUEST
    assert "data_inicio" in resposta.data


def test_endpoint_sem_parametros_retorna_400(client: APIClient, db) -> None:
    """GET /api/comissoes/ sem data_inicio/data_fim retorna 400."""
    resposta = client.get("/api/comissoes/")

    assert resposta.status_code == status.HTTP_400_BAD_REQUEST
