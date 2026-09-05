"""Serializers da API do app vendas."""

from rest_framework import serializers

from .models import ItemVenda, Venda


class ItemVendaSerializer(serializers.ModelSerializer):
    """Serializa um item de venda (produto + quantidade) dentro de uma Venda."""

    class Meta:
        """Define o model e os campos do item de venda."""

        model = ItemVenda
        fields = ["id", "produto", "quantidade", "subtotal"]


class VendaSerializer(serializers.ModelSerializer):
    """Serializa/valida Venda, incluindo seus itens, para a API REST."""

    itens = ItemVendaSerializer(many=True)
    cliente_nome = serializers.CharField(source="cliente.nome", read_only=True)
    vendedor_nome = serializers.CharField(source="vendedor.nome", read_only=True)

    class Meta:
        """Define o model e os campos expostos pela API."""

        model = Venda
        fields = [
            "id",
            "numero_nota_fiscal",
            "data_hora",
            "cliente",
            "cliente_nome",
            "vendedor",
            "vendedor_nome",
            "itens",
            "valor_total",
        ]

    def create(self, validated_data: dict) -> Venda:
        """Cria a venda e seus itens numa única operação."""
        itens_data = validated_data.pop("itens")
        venda = Venda.objects.create(**validated_data)
        for item_data in itens_data:
            ItemVenda.objects.create(venda=venda, **item_data)
        return venda

    def update(self, instance: Venda, validated_data: dict) -> Venda:
        """Atualiza a venda; substitui todos os itens pelos enviados."""
        itens_data = validated_data.pop("itens")
        for atributo, valor in validated_data.items():
            setattr(instance, atributo, valor)
        instance.save()

        instance.itens.all().delete()
        for item_data in itens_data:
            ItemVenda.objects.create(venda=instance, **item_data)
        return instance
