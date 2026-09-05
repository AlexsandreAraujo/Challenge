"""Views da API do app vendas."""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import PageNumberPagination

from .models import Venda
from .serializers import VendaSerializer


class VendaPagination(PageNumberPagination):
    """Pagina a listagem de vendas em blocos de 10."""

    page_size = 10


class VendaViewSet(viewsets.ModelViewSet):
    """CRUD completo de Venda (com itens) via API REST."""

    queryset = Venda.objects.select_related("cliente", "vendedor").prefetch_related(
        "itens__produto"
    )
    serializer_class = VendaSerializer
    pagination_class = VendaPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["cliente", "vendedor"]
    search_fields = ["numero_nota_fiscal", "cliente__nome", "vendedor__nome"]
    ordering_fields = ["data_hora", "numero_nota_fiscal"]
    ordering = ["-data_hora"]
