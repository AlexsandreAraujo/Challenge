"""Serializers da API do app comissoes."""

from rest_framework import serializers

from pessoas.serializers import VendedorSerializer


class PeriodoSerializer(serializers.Serializer):
    """Valida o período (data_inicio, data_fim) recebido via query params."""

    data_inicio = serializers.DateField()
    data_fim = serializers.DateField()


class ComissaoVendedorSerializer(serializers.Serializer):
    """Serializa o total de vendas e de comissão de um vendedor num período."""

    vendedor = VendedorSerializer()
    total_vendas = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
