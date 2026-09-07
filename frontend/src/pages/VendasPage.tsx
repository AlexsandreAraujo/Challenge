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
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import { cores } from "../theme";

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    valor
  );

const formatarData = (iso: string) => {
  const data = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()} - ${pad(
    data.getHours()
  )}:${pad(data.getMinutes())}`;
};

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
          Vendas Realizadas
        </Typography>
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

      <TableContainer
        component={Paper}
        sx={{ boxShadow: "none", border: "none", maxHeight: "81vh", overflow: "auto" }}
      >
        <Table>
          <TableHead
            sx={{
              "& .MuiTableCell-root": {
                fontWeight: "bold",
                borderBottom: 1,
                borderColor: cores.bordaTabela,
              },
            }}
>
            <TableRow>
              <TableCell align="center">Nota Fiscal</TableCell>
              <TableCell align="left">Cliente</TableCell>
              <TableCell align="left">Vendedor</TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active
                  direction={ordenacao === "data_hora" ? "asc" : "desc"}
                  onClick={alternarOrdenacao}
                >
                  Data da Venda
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Valor Total</TableCell>
              <TableCell align="center">Opções</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendas.map((venda) => (
              <Fragment key={venda.id}>
                <TableRow sx={{ "& .MuiTableCell-root": { borderBottom: 1, borderColor: cores.bordaTabela } }}>
                  <TableCell align="center">{venda.numero_nota_fiscal}</TableCell>
                  <TableCell>{venda.cliente_nome}</TableCell>
                  <TableCell>{venda.vendedor_nome}</TableCell>
                  <TableCell align="center">{formatarData(venda.data_hora)}</TableCell>
                  <TableCell align="center">{formatarMoeda(venda.valor_total)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 3 }}>
                      <Button
                        size="small"                        
                        sx={{ fontWeight: "bold" }}
                        onClick={() =>
                          setItemExpandido(itemExpandido === venda.id ? null : venda.id)
                        }
                      >
                        {itemExpandido === venda.id ? "Fechar" : "Ver itens"}
                      </Button>
                      <IconButton component={Link} to={`/vendas/${venda.id}/editar`} size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setVendaParaExcluir(venda.id)}
                        sx={{ "&:hover": { backgroundColor: "#EEC5C4" } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                    <Collapse in={itemExpandido === venda.id}>
                      <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "none" } }}>
                        <TableHead sx={{ "& .MuiTableCell-root": { fontWeight: "bold" } }}>
                          <TableRow>
                            <TableCell align="left">Produtos/Serviço</TableCell>
                            <TableCell align="center">Quantidade</TableCell>
                            <TableCell align="center">Preço unitário</TableCell>
                            <TableCell align="center">Total do Produto</TableCell>
                            <TableCell align="center">% de Comissão</TableCell>
                            <TableCell align="center">Comissão</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {venda.itens.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell align="left">
                                {item.produto_codigo} - {item.produto_descricao}
                              </TableCell>
                              <TableCell align="center">{item.quantidade}</TableCell>
                              <TableCell align="center">{formatarMoeda(Number(item.valor_unitario))}</TableCell>
                              <TableCell align="center">{formatarMoeda(item.subtotal)}</TableCell>
                              <TableCell align="center">{item.percentual_comissao}%</TableCell>
                              <TableCell align="center">{formatarMoeda(item.comissao)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell
                              align="left"
                              sx={{ fontWeight: "bold", pt: 3, borderBottom: `1px solid ${cores.bordaTabela} !important` }}
                            >
                              Total da Venda
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", pt: 3, borderBottom: `1px solid ${cores.bordaTabela} !important` }}
                            >
                              {venda.itens.reduce((soma, item) => soma + item.quantidade, 0)}
                            </TableCell>
                            <TableCell sx={{ borderBottom: `1px solid ${cores.bordaTabela} !important` }} />
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", pt: 3, borderBottom: `1px solid ${cores.bordaTabela} !important` }}
                            >
                              {formatarMoeda(venda.valor_total)}
                            </TableCell>
                            <TableCell sx={{ borderBottom: `1px solid ${cores.bordaTabela} !important` }} />
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", pt: 3, borderBottom: `1px solid ${cores.bordaTabela} !important` }}
                            >
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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setMensagemSucesso(null)}>
          {mensagemSucesso}
        </Alert>
      </Snackbar>
      <Dialog
        open={vendaParaExcluir !== null}
        onClose={() => setVendaParaExcluir(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "text.primary",
          }}
        >
          Remover Venda
          <IconButton size="small" onClick={() => setVendaParaExcluir(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider sx={{ mx: 2 }} />
        <DialogContent>
          <Typography>Deseja remover esta venda?</Typography>
        </DialogContent>
        <Divider sx={{ mx: 2 }} />
        <DialogActions sx={{ px: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setVendaParaExcluir(null)}
            sx={{
              borderWidth: 2,
              "&:hover": { borderWidth: 2 },
            }}
          >
            Não
          </Button>
          <Button variant="contained" color="primary" onClick={confirmarExclusao}>
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}