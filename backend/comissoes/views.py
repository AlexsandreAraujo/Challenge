"""Views da API do app comissoes."""

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ComissaoVendedorSerializer, PeriodoSerializer
from .services import calcular_comissoes_por_vendedor


class ComissaoPorVendedorView(APIView):
    """Retorna o total de comissão de cada vendedor num período."""

    def get(self, request: Request) -> Response:
        """Calcula as comissões do período informado via query params."""
        periodo = PeriodoSerializer(data=request.query_params)
        periodo.is_valid(raise_exception=True)

        resultado = calcular_comissoes_por_vendedor(
            periodo.validated_data["data_inicio"], periodo.validated_data["data_fim"]
        )
        serializer = ComissaoVendedorSerializer(resultado, many=True)
        return Response(serializer.data)
