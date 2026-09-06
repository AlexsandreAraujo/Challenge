"""Serializers da API do app pessoas."""

from rest_framework import serializers

from .models import Cliente, Vendedor


class ClienteSerializer(serializers.ModelSerializer):
    """Serializa/valida Cliente para a API REST."""

    class Meta:
        """Define o model e os campos expostos pela API."""

        model = Cliente
        fields = ["id", "nome", "email", "telefone"]


class VendedorSerializer(serializers.ModelSerializer):
    """Serializa/valida Vendedor para a API REST."""

    class Meta:
        """Define o model e os campos expostos pela API."""

        model = Vendedor
        fields = ["id", "codigo", "nome", "email", "telefone"]
