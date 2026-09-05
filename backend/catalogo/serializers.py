"""Serializers da API do app catalogo."""

from rest_framework import serializers

from .models import Produto


class ProdutoSerializer(serializers.ModelSerializer):
    """Serializa/valida Produto para a API REST."""

    class Meta:
        """Define o model e os campos expostos pela API."""

        model = Produto
        fields = ["id", "codigo", "descricao", "valor_unitario", "percentual_comissao"]
