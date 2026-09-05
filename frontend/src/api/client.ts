import type {
  Cliente,
  ComissaoVendedor,
  Produto,
  Vendedor,
  Venda,
  VendaInput,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Wrapper de fetch genérico para a API: adiciona a base URL, lança erro
 * com o corpo da resposta em caso de falha, e trata 204 (sem corpo)
 * separadamente, já que `response.json()` falharia num corpo vazio.
 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const resposta = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null);
    throw new Error(erro ? JSON.stringify(erro) : `Erro ${resposta.status}`);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  return resposta.json();
}

export const getProdutos = () => request<Produto[]>("/produtos/");
export const getClientes = () => request<Cliente[]>("/clientes/");
export const getVendedores = () => request<Vendedor[]>("/vendedores/");

export const getVendas = () => request<Venda[]>("/vendas/");

export const createVenda = (dados: VendaInput) =>
  request<Venda>("/vendas/", {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const updateVenda = (id: number, dados: VendaInput) =>
  request<Venda>(`/vendas/${id}/`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const deleteVenda = (id: number) =>
  request<void>(`/vendas/${id}/`, { method: "DELETE" });

export const getComissoes = (dataInicio: string, dataFim: string) =>
  request<ComissaoVendedor[]>(
    `/comissoes/?data_inicio=${dataInicio}&data_fim=${dataFim}`
  );

export const getVenda = (id: number) => request<Venda>(`/vendas/${id}/`);