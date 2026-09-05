import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import { getComissoes } from "../api/client";
import type { ComissaoVendedor } from "../api/types";

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    valor
  );

export function ComissoesPage() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [resultado, setResultado] = useState<ComissaoVendedor[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = async () => {
    if (!dataInicio || !dataFim) {
      setErro("Selecione o período de início e fim.");
      return;
    }
    setErro(null);
    try {
      const dados = await getComissoes(dataInicio, dataFim);
      setResultado(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao buscar comissões.");
    }
  };

  const totalGeral = (resultado ?? []).reduce(
    (total, item) => total + Number(item.total),
    0
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Relatório de Comissões</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            type="date"
            label="Período de Início"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            label="Período de Fim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <IconButton onClick={buscar} color="primary">
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {erro && <Typography color="error">{erro}</Typography>}

      {resultado === null && !erro && (
        <Typography color="text.secondary">
          Para visualizar o relatório, selecione um período nos campos acima.
        </Typography>
      )}

      {resultado !== null && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vendedor</TableCell>
                <TableCell>Total de Comissões</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultado.map((item) => (
                <TableRow key={item.vendedor.id}>
                  <TableCell>{item.vendedor.nome}</TableCell>
                  <TableCell>{formatarMoeda(Number(item.total))}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Total Geral</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {formatarMoeda(totalGeral)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}