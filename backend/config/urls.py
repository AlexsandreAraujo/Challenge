"""Configuração de URLs do projeto."""

from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalogo.views import ProdutoViewSet
from comissoes.views import ComissaoPorVendedorView
from pessoas.views import ClienteViewSet, VendedorViewSet
from vendas.views import VendaViewSet

router = DefaultRouter()
router.register("produtos", ProdutoViewSet)
router.register("clientes", ClienteViewSet)
router.register("vendedores", VendedorViewSet)
router.register("vendas", VendaViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path(
        "api/comissoes/",
        ComissaoPorVendedorView.as_view(),
        name="comissoes-por-vendedor",
    ),
]
