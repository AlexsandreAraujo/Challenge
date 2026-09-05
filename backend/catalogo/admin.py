"""Administração do app catalogo."""

from django.contrib import admin

from .models import Produto


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    """Configuração do Django Admin para o model Produto."""

    list_display = ("codigo", "descricao", "valor_unitario", "percentual_comissao")
    search_fields = ("codigo", "descricao")
