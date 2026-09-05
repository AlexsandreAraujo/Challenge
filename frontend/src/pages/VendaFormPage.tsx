import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  createVenda,
  getClientes,
  getProdutos,
  getVenda,
  getVendedores,
  updateVenda,
} from "../api/client";
import type { Cliente, Produto, Vendedor, ItemVendaInput } from "../api/types";

const paraDatetimeLocal = (iso: string) => {
  const data = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(
    data.getHours()
  )}:${pad(data.getMinutes())}`;
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    valor
  );

export function VendaFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const editando = Boolean(id);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  const [numeroNotaFiscal, setNumeroNotaFiscal] = useState("");
  const [dataHora, setDataHora] = useState(() =>
    paraDatetimeLocal(new Date().toISOString())
  );
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [itens, setItens] = useState<ItemVendaInput[]>([]);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getProdutos().then(setProdutos);
    getClientes().then(setClientes);
    getVendedores().then(setVendedores);
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    getVenda(Number(id)).then((venda) => {
      setNumeroNotaFiscal(venda.numero_nota_fiscal);
      setDataHora(paraDatetimeLocal(venda.data_hora));
      setCliente({ id: venda.cliente, nome: venda.cliente_nome } as Cliente);
      setVendedor({ id: venda.vendedor, nome: venda.vendedor_nome } as Vendedor);
      setItens(
        venda.itens.map((item) => ({
          produto: item.produto,
          quantidade: item.quantidade,
        }))
      );
    });
  }, [id]);

  const adicionarItem = () => {
    if (!produtoSelecionado) {
      return;
    }
    setItens([...itens, { produto: produtoSelecionado.id, quantidade }]);
    setProdutoSelecionado(null);
    setQuantidade(1);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const buscarProduto = (produtoId: number) =>
    produtos.find((p) => p.id === produtoId);

  const valorTotal = itens.reduce((total, item) => {
    const produto = buscarProduto(item.produto);
    return total + (produto ? Number(produto.valor_unitario) * item.quantidade : 0);
  }, 0);

  const finalizar = async () => {
    if (!cliente || !vendedor || !dataHora || itens.length === 0) {
      setErro("Preencha data/hora, cliente, vendedor e ao menos um item.");
      return;
    }

    const dados = {
      numero_nota_fiscal: numeroNotaFiscal,
      data_hora: new Date(dataHora).toISOString(),
      cliente: cliente.id,
      vendedor: vendedor.id,
      itens,
    };

    try {
      if (editando) {
        await updateVenda(Number(id), dados);
      } else {
        await createVenda(dados);
      }
      navigate("/vendas");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar a venda.");
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {editando ? "Editar Venda" : "Nova Venda"}
      </Typography>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 2 }}>
          <Typography variant="h6">Produtos</Typography>
          <Box sx={{ display: "flex", gap: 2, my: 2 }}>
            <Autocomplete
              options={produtos}
              getOptionLabel={(p) => `${p.codigo} - ${p.descricao}`}
              value={produtoSelecionado}
              onChange={(_, valor) => setProdutoSelecionado(valor)}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField {...params} label="Buscar produto" />
              )}
            />
            <TextField
              type="number"
              label="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              sx={{ width: 120 }}
            />
            <Button variant="contained" onClick={adicionarItem}>
              Adicionar
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produtos/Serviço</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Preço unitário</TableCell>
                <TableCell>Total</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {itens.map((item, index) => {
                const produto = buscarProduto(item.produto);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {produto ? `${produto.codigo} - ${produto.descricao}` : "..."}
                    </TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>
                      {produto && formatarMoeda(Number(produto.valor_unitario))}
                    </TableCell>
                    <TableCell>
                      {produto &&
                        formatarMoeda(Number(produto.valor_unitario) * item.quantidade)}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => removerItem(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Dados da venda</Typography>
          <TextField
            label="Número da Nota Fiscal"
            value={numeroNotaFiscal}
            onChange={(e) => setNumeroNotaFiscal(e.target.value)}
            fullWidth
            sx={{ my: 1 }}
          />
          <TextField
            type="datetime-local"
            label="Data e Hora da Venda"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            fullWidth
            sx={{ my: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Autocomplete
            options={vendedores}
            getOptionLabel={(v) => v.nome}
            value={vendedor}
            onChange={(_, valor) => setVendedor(valor)}
            sx={{ my: 1 }}
            renderInput={(params) => (
              <TextField {...params} label="Escolha um vendedor" />
            )}
          />
          <Autocomplete
            options={clientes}
            getOptionLabel={(c) => c.nome}
            value={cliente}
            onChange={(_, valor) => setCliente(valor)}
            sx={{ my: 1 }}
            renderInput={(params) => (
              <TextField {...params} label="Escolha um cliente" />
            )}
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Valor total da venda: {formatarMoeda(valorTotal)}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button onClick={() => navigate("/vendas")}>Cancelar</Button>
            <Button variant="contained" onClick={finalizar}>
              Finalizar
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}