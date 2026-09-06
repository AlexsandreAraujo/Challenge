"""Testes da API REST do app vendas."""

from datetime import datetime
from decimal import Decimal

from django.utils.timezone import make_aware
from rest_framework import status
from rest_framework.test import APIClient

from catalogo.models import Produto
from pessoas.models import Cliente, Vendedor
from vendas.models import ItemVenda, Venda


def test_cria_venda_com_itens(
    client: APIClient, cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """POST /api/vendas/ cria a venda e seus itens numa única chamada."""
    dados = {
        "data_hora": "2026-09-09T10:00:00Z",
        "cliente": cliente.id,
        "vendedor": vendedor.id,
        "itens": [{"produto": produto.id, "quantidade": 2}],
    }

    resposta = client.post("/api/vendas/", dados, format="json")

    assert resposta.status_code == status.HTTP_201_CREATED
    venda = Venda.objects.get(id=resposta.data["id"])
    assert venda.itens.count() == 1
    assert resposta.data["valor_total"] == Decimal("20.00")


def test_cria_venda_com_quantidade_invalida_retorna_400(
    client: APIClient, cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """POST /api/vendas/ com quantidade menor que 1 retorna 400."""
    dados = {
        "data_hora": "2026-09-09T10:00:00Z",
        "cliente": cliente.id,
        "vendedor": vendedor.id,
        "itens": [{"produto": produto.id, "quantidade": 0}],
    }

    resposta = client.post("/api/vendas/", dados, format="json")

    assert resposta.status_code == status.HTTP_400_BAD_REQUEST


def test_atualiza_venda_substitui_itens(
    client: APIClient, cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """PUT /api/vendas/<id>/ substitui os itens da venda pelos enviados."""
    venda = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )
    ItemVenda.objects.create(venda=venda, produto=produto, quantidade=1)

    outro_produto = Produto.objects.create(
        codigo="P200",
        descricao="Borracha",
        valor_unitario=Decimal("3.00"),
        percentual_comissao=Decimal("2.00"),
    )
    dados = {
        "data_hora": "2026-09-09T10:00:00Z",
        "cliente": cliente.id,
        "vendedor": vendedor.id,
        "itens": [{"produto": outro_produto.id, "quantidade": 5}],
    }

    resposta = client.put(f"/api/vendas/{venda.id}/", dados, format="json")

    assert resposta.status_code == status.HTTP_200_OK
    venda.refresh_from_db()
    assert venda.itens.count() == 1
    assert venda.itens.first().produto == outro_produto


def test_exclui_venda_remove_itens_em_cascata(
    client: APIClient, cliente: Cliente, vendedor: Vendedor, produto: Produto
) -> None:
    """DELETE /api/vendas/<id>/ remove a venda e seus itens (CASCADE)."""
    venda = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )
    item = ItemVenda.objects.create(venda=venda, produto=produto, quantidade=1)

    resposta = client.delete(f"/api/vendas/{venda.id}/")

    assert resposta.status_code == status.HTTP_204_NO_CONTENT
    assert not Venda.objects.filter(id=venda.id).exists()
    assert not ItemVenda.objects.filter(id=item.id).exists()


def test_lista_vendas_paginada(
    client: APIClient, cliente: Cliente, vendedor: Vendedor
) -> None:
    """GET /api/vendas/ retorna resposta paginada."""
    for _ in range(3):
        Venda.objects.create(
            data_hora=make_aware(datetime(2026, 9, 9)),
            cliente=cliente,
            vendedor=vendedor,
        )

    resposta = client.get("/api/vendas/")

    assert resposta.status_code == status.HTTP_200_OK
    assert "results" in resposta.data
    assert resposta.data["count"] == 3


def test_busca_vendas_por_numero_nota_fiscal(
    client: APIClient, cliente: Cliente, vendedor: Vendedor
) -> None:
    """GET /api/vendas/?search=... filtra pelo número da nota fiscal (ID)."""
    venda = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )
    Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )

    resposta = client.get("/api/vendas/", {"search": venda.numero_nota_fiscal})

    assert resposta.data["count"] == 1
    assert resposta.data["results"][0]["id"] == venda.id


def test_ordena_vendas_por_data_hora(
    client: APIClient, cliente: Cliente, vendedor: Vendedor
) -> None:
    """GET /api/vendas/?ordering=data_hora ordena do mais antigo pro mais novo."""
    venda_mais_nova = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 10)),
        cliente=cliente,
        vendedor=vendedor,
    )
    venda_mais_antiga = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 8)),
        cliente=cliente,
        vendedor=vendedor,
    )

    resposta = client.get("/api/vendas/", {"ordering": "data_hora"})

    ids = [v["id"] for v in resposta.data["results"]]
    assert ids == [venda_mais_antiga.id, venda_mais_nova.id]


def test_busca_nao_confunde_termos_entre_campos_diferentes(
    client: APIClient, cliente: Cliente, vendedor: Vendedor
) -> None:
    """Busca por frase não deve casar palavras espalhadas em campos diferentes."""
    venda = Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=cliente,
        vendedor=vendedor,
    )
    outro_cliente = Cliente.objects.create(
        nome="Cliente 2", email="cliente2@example.com", telefone="11944444444"
    )
    Venda.objects.create(
        data_hora=make_aware(datetime(2026, 9, 9)),
        cliente=outro_cliente,
        vendedor=vendedor,
    )

    resposta = client.get("/api/vendas/", {"search": cliente.nome})

    assert resposta.data["count"] == 1
    assert resposta.data["results"][0]["id"] == venda.id
