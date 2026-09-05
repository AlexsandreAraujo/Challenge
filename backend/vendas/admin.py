"""Admin do app vendas."""

from django.contrib import admin

from .models import ItemVenda, Venda


class ItemVendaInline(admin.TabularInline):
    """Permite editar os itens de uma venda na própria tela da venda."""

    model = ItemVenda
    extra = 1


@admin.register(Venda)
class VendaAdmin(admin.ModelAdmin):
    """Admin do model Venda, com os itens editáveis inline."""

    list_display = (
        "numero_nota_fiscal",
        "data_hora",
        "cliente",
        "vendedor",
        "valor_total",
    )
    inlines = [ItemVendaInline]
