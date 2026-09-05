"""Views da API do app pessoas."""

from rest_framework import viewsets

from .models import Cliente, Vendedor
from .serializers import ClienteSerializer, VendedorSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    """CRUD completo de Cliente via API REST."""

    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class VendedorViewSet(viewsets.ModelViewSet):
    """CRUD completo de Vendedor via API REST."""

    queryset = Vendedor.objects.all()
    serializer_class = VendedorSerializer
