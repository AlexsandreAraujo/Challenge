"""Configuração de URLs do projeto."""

from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalogo.views import ProdutoViewSet

router = DefaultRouter()
router.register("produtos", ProdutoViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]
