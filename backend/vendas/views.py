"""Views da API do app vendas."""

from django.db.models import Q
from django_filters import rest_framework as django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.pagination import PageNumberPagination

from .models import Venda
from .serializers import VendaSerializer


class VendaPagination(PageNumberPagination):
    """Pagina a listagem de vendas em blocos de 10."""

    page_size = 10


class VendaFilterSet(django_filters.FilterSet):
    """Filtros customizados para a listagem de vendas."""

    search = django_filters.CharFilter(method="filtrar_busca", label="Busca")

    class Meta:
        """Define o model e os campos filtráveis."""

        model = Venda
        fields = ["cliente", "vendedor"]

    def filtrar_busca(self, queryset, name, value):
        """Filtra vendas cuja nota fiscal, cliente ou vendedor contenham o termo."""
        return queryset.filter(
            Q(numero_nota_fiscal__icontains=value)
            | Q(cliente__nome__icontains=value)
            | Q(vendedor__nome__icontains=value)
        )


class VendaViewSet(viewsets.ModelViewSet):
    """CRUD completo de Venda (com itens) via API REST."""

    queryset = Venda.objects.select_related("cliente", "vendedor").prefetch_related(
        "itens__produto"
    )
    serializer_class = VendaSerializer
    pagination_class = VendaPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = VendaFilterSet
    ordering_fields = ["data_hora", "numero_nota_fiscal"]
    ordering = ["-data_hora"]
