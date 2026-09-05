"""Views da API do app vendas."""

from rest_framework import viewsets

from .models import Venda
from .serializers import VendaSerializer


class VendaViewSet(viewsets.ModelViewSet):
    """CRUD completo de Venda (com itens) via API REST."""

    queryset = Venda.objects.select_related("cliente", "vendedor").prefetch_related(
        "itens__produto"
    )
    serializer_class = VendaSerializer
