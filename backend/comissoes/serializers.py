"""Serializers da API do app comissoes."""

from rest_framework import serializers

from pessoas.serializers import VendedorSerializer


class PeriodoSerializer(serializers.Serializer):
    """Valida o período (data_inicio, data_fim) recebido via query params."""

    data_inicio = serializers.DateField()
    data_fim = serializers.DateField()


class ComissaoVendedorSerializer(serializers.Serializer):
    """Serializa quantidade de vendas e total de comissão de um vendedor no período."""

    vendedor = VendedorSerializer()
    total_vendas = serializers.IntegerField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
