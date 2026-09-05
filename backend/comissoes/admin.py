"""Admin do app comissoes."""

from django.contrib import admin

from .models import FaixaComissaoDia


@admin.register(FaixaComissaoDia)
class FaixaComissaoDiaAdmin(admin.ModelAdmin):
    """Configuração do Django Admin para FaixaComissaoDia."""

    list_display = ("get_dia_semana_display", "comissao_minima", "comissao_maxima")
