export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  valor_unitario: string;
  percentual_comissao: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface ItemVenda {
  id: number;
  produto: number;
  produto_codigo: string;
  produto_descricao: string;
  quantidade: number;
  valor_unitario: string;
  subtotal: number;
  percentual_comissao: number;
  comissao: number;
}

export interface Venda {
  id: number;
  numero_nota_fiscal: string;
  data_hora: string;
  cliente: number;
  cliente_nome: string;
  vendedor: number;
  vendedor_nome: string;
  itens: ItemVenda[];
  valor_total: number;
}

export interface ComissaoVendedor {
  vendedor: Vendedor;
  total: string;
}

export interface ItemVendaInput {
  produto: number;
  quantidade: number;
}

export interface VendaInput {
  numero_nota_fiscal: string;
  data_hora: string;
  cliente: number;
  vendedor: number;
  itens: ItemVendaInput[];
}