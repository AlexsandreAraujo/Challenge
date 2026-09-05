"""Admin do app pessoas."""

from django.contrib import admin

from .models import Cliente, Vendedor


class PessoaAdmin(admin.ModelAdmin):
    """Configuração compartilhada de admin para Cliente e Vendedor."""

    list_display = ("nome", "email", "telefone")
    search_fields = ("nome", "email")


@admin.register(Cliente)
class ClienteAdmin(PessoaAdmin):
    """Admin do model Cliente."""


@admin.register(Vendedor)
class VendedorAdmin(PessoaAdmin):
    """Admin do model Vendedor."""
