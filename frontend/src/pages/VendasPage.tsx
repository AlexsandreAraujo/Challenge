import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import { EditIcon } from "../components/icons/EditIcon";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteVenda, getVendas } from "../api/client";
import Pagination from "@mui/material/Pagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import type { VendasQuery } from "../api/client";
import type { Venda } from "../api/types";
import TextField from "@mui/material/TextField";
import { Titulo } from "../components/Layout";
import { useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    valor
  );

const formatarData = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));

export function VendasPage() {
  const PAGE_SIZE = 10;
  const location = useLocation();

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<"data_hora" | "-data_hora">(
    "-data_hora"
  );
  const [pagina, setPagina] = useState(1);
  const [itemExpandido, setItemExpandido] = useState<number | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(
    (location.state as { mensagem?: string } | null)?.mensagem ?? null
  );
  const [vendaParaExcluir, setVendaParaExcluir] = useState<number | null>(null);

  const carregarVendas = () => {
    const query: VendasQuery = { ordering: ordenacao, page: pagina };
    if (busca) {
      query.search = busca;
    }
    getVendas(query).then((resposta) => {
      setVendas(resposta.results);
      setTotal(resposta.count);
    });
  };

  useEffect(carregarVendas, [busca, ordenacao, pagina]);

  const alternarOrdenacao = () => {
    setOrdenacao(ordenacao === "data_hora" ? "-data_hora" : "data_hora");
    setPagina(1);
  };

  const confirmarExclusao = async () => {
    if (vendaParaExcluir === null) {
      return;
    }
    await deleteVenda(vendaParaExcluir);
    setVendaParaExcluir(null);
    carregarVendas();
  };

  return (
    <>
      <Titulo texto="Vendas" />
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="contained" component={Link} to="/vendas/nova">
          Inserir nova Venda
        </Button>
      </Box>

      <TextField
        label="Buscar por nota fiscal, cliente ou vendedor"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setPagina(1);
        }}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nota Fiscal</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell>
                <TableSortLabel
                  active
                  direction={ordenacao === "data_hora" ? "asc" : "desc"}
                  onClick={alternarOrdenacao}
                >
                  Data da Venda
                </TableSortLabel>
              </TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Opções</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendas.map((venda) => (
              <Fragment key={venda.id}>
                <TableRow>
                  <TableCell>{venda.numero_nota_fiscal}</TableCell>
                  <TableCell>{venda.cliente_nome}</TableCell>
                  <TableCell>{venda.vendedor_nome}</TableCell>
                  <TableCell>{formatarData(venda.data_hora)}</TableCell>
                  <TableCell>{formatarMoeda(venda.valor_total)}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() =>
                        setItemExpandido(itemExpandido === venda.id ? null : venda.id)
                      }
                    >
                      {itemExpandido === venda.id ? "Fechar" : "Ver itens"}
                    </Button>
                    <IconButton component={Link} to={`/vendas/${venda.id}/editar`} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setVendaParaExcluir(venda.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                    <Collapse in={itemExpandido === venda.id}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Produtos/Serviço</TableCell>
                            <TableCell>Quantidade</TableCell>
                            <TableCell>Preço unitário</TableCell>
                            <TableCell>Total do Produto</TableCell>
                            <TableCell>% de Comissão</TableCell>
                            <TableCell>Comissão</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {venda.itens.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {item.produto_codigo} - {item.produto_descricao}
                              </TableCell>
                              <TableCell>{item.quantidade}</TableCell>
                              <TableCell>{formatarMoeda(Number(item.valor_unitario))}</TableCell>
                              <TableCell>{formatarMoeda(item.subtotal)}</TableCell>
                              <TableCell>{item.percentual_comissao}%</TableCell>
                              <TableCell>{formatarMoeda(item.comissao)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                              Total da Venda
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              {formatarMoeda(venda.valor_total)}
                            </TableCell>
                            <TableCell />
                            <TableCell sx={{ fontWeight: "bold" }}>
                              {formatarMoeda(
                                venda.itens.reduce((soma, item) => soma + item.comissao, 0)
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(total / PAGE_SIZE)}
        page={pagina}
        onChange={(_, novaPagina) => setPagina(novaPagina)}
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />
      <Snackbar
        open={Boolean(mensagemSucesso)}
        autoHideDuration={4000}
        onClose={() => setMensagemSucesso(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setMensagemSucesso(null)}>
          {mensagemSucesso}
        </Alert>
      </Snackbar>
      <Dialog open={vendaParaExcluir !== null} onClose={() => setVendaParaExcluir(null)}>
        <DialogTitle>Excluir esta venda?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setVendaParaExcluir(null)}>Cancelar</Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}