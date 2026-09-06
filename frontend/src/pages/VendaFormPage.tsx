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
import { Titulo } from "../components/Layout";
import dayjs, { type Dayjs } from "dayjs";

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

  const [numeroCarregado, setNumeroCarregado] = useState("");

  const [dataHora, setDataHora] = useState<Dayjs | null>(() => dayjs());
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [itens, setItens] = useState<ItemVendaInput[]>([]);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState<string | null>(null);

  const formularioValido = Boolean(cliente && vendedor && dataHora && itens.length > 0);

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
      setNumeroCarregado(venda.numero_nota_fiscal);
      setDataHora(dayjs(venda.data_hora));
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
    if (quantidade < 1) {
      setErro("A quantidade deve ser no mínimo 1.");
      return;
    }
    setItens([...itens, { produto: produtoSelecionado.id, quantidade }]);
    setProdutoSelecionado(null);
    setQuantidade(1);
    setErro(null);
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
      data_hora: dataHora!.toISOString(),
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
      navigate("/vendas", {
        state: {
          mensagem: editando
            ? "VENDA ALTERADA COM SUCESSO!"
            : "VENDA REALIZADA COM SUCESSO!",
        },
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar a venda.");
    }
  };

  return (
    <Box sx={{ px: "24px" }}>
      <Titulo texto={editando ? `Alterar Venda - Nº ${numeroCarregado}` : "Nova Venda"} />
      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 4, minHeight: "calc(100vh - 64px - 48px)" }}>
        <Box sx={{ flex: 2, borderRight: 1, borderColor: "divider", pr: 4 }}>
          <Typography variant="h6" align="left">
            Produtos
          </Typography>
          <Box sx={{ display: "flex", gap: 2, my: 2, alignItems: "flex-end" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" align="left" sx={{ mb: 0.5 }}>
                Buscar pelo código de barras ou descrição
              </Typography>
              <Autocomplete
                options={produtos}
                getOptionLabel={(p) => `${p.codigo} - ${p.descricao}`}
                value={produtoSelecionado}
                onChange={(_, valor) => setProdutoSelecionado(valor)}
                slotProps={{ listbox: { sx: { maxHeight: 252, overflow: "auto" } } }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Digite o código ou nome do produto" />
                )}
              />
            </Box>
            <Box>
              <Typography variant="body2" align="left" sx={{ mb: 0.5 }}>
                Quantidade de itens
              </Typography>
              <TextField
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1 } }}
                sx={{ width: 145 }}
              />
            </Box>
            <Button variant="contained" onClick={adicionarItem} sx={{ height: 58 }}>
              Adicionar
            </Button>
          </Box>

          <Table sx={{ "& .MuiTableCell-root": { border: "none" } }}>
            <TableHead sx={{ "& .MuiTableCell-root": { fontWeight: "bold", fontSize: 16 } }}>
              <TableRow>
                <TableCell align="left">Produtos/Serviço</TableCell>
                <TableCell align="center">Quantidade</TableCell>
                <TableCell align="center">Preço unitário</TableCell>
                <TableCell align="center">Total</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {itens.map((item, index) => {
                const produto = buscarProduto(item.produto);
                return (
                  <TableRow key={index}>
                    <TableCell align="left">
                      {produto ? `${produto.codigo} - ${produto.descricao}` : "..."}
                    </TableCell>
                    <TableCell align="center">{item.quantidade}</TableCell>
                    <TableCell align="center">
                      {produto && formatarMoeda(Number(produto.valor_unitario))}
                    </TableCell>
                    <TableCell align="center">
                      {produto &&
                        formatarMoeda(Number(produto.valor_unitario) * item.quantidade)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => removerItem(index)} 
                        sx={{ "&:hover": { backgroundColor: "#EEC5C4" } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" align="left">
            Dados da venda
          </Typography>
          <Typography variant="body2" align="left" sx={{ mt: 2, mb: 0.5 }}>
            Data e Hora da Venda
          </Typography>
          <TextField
            value={dataHora ? dataHora.format("DD/MM/YYYY - HH:mm") : ""}
            disabled
            fullWidth
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" align="left" sx={{ mt: 2, mb: 0.5 }}>
            Escolha um vendedor
          </Typography>
          <Autocomplete
            options={vendedores}
            getOptionLabel={(v) => v.nome}
            value={vendedor}
            onChange={(_, valor) => setVendedor(valor)}
            slotProps={{ listbox: { sx: { maxHeight: 252, overflow: "auto" } } }}
            sx={{ mb: 2 }}
            renderInput={(params) => <TextField {...params} placeholder="Selecione o nome" />}
          />
          <Typography variant="body2" align="left" sx={{ mt: 2, mb: 0.5 }}>
            Escolha um cliente
          </Typography>
          <Autocomplete
            options={clientes}
            getOptionLabel={(c) => c.nome}
            value={cliente}
            onChange={(_, valor) => setCliente(valor)}
            slotProps={{ listbox: { sx: { maxHeight: 252, overflow: "auto" } } }}
            sx={{ my: 1 }}
            renderInput={(params) => <TextField {...params} placeholder="Selecione o nome" />}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 32 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Valor total da venda:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: 24 }}>
              {formatarMoeda(valorTotal)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: "auto" }}>
            <Button variant="contained" onClick={() => navigate("/vendas")}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={finalizar} disabled={!formularioValido}>
              Finalizar
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}