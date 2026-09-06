import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getComissoes } from "../api/client";
import type { ComissaoVendedor } from "../api/types";
import { Titulo } from "../components/Layout";

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    valor
  );

export function ComissoesPage() {
  const [dataInicio, setDataInicio] = useState<Dayjs | null>(null);
  const [dataFim, setDataFim] = useState<Dayjs | null>(null);
  const [resultado, setResultado] = useState<ComissaoVendedor[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = async () => {
    if (!dataInicio || !dataFim) {
      setErro("Selecione o período de início e fim.");
      return;
    }
    setErro(null);
    try {
      const dados = await getComissoes(
        dataInicio.format("YYYY-MM-DD"),
        dataFim.format("YYYY-MM-DD")
      );
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Titulo texto="Comissões" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Relatório de Comissões</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <DatePicker
            label="Período de Início"
            value={dataInicio}
            onChange={setDataInicio}
            format="DD/MM/YYYY"
          />
          <DatePicker
            label="Período de Fim"
            value={dataFim}
            onChange={setDataFim}
            format="DD/MM/YYYY"
          />
          <IconButton onClick={buscar} color="primary">
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {erro && <Typography color="error">{erro}</Typography>}

      {resultado === null && !erro && (
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          Para visualizar o relatório, selecione um período nos campos acima.
        </Typography>
      )}

      {resultado !== null && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cód.</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell>Total de Vendas</TableCell>
                <TableCell>Total de Comissões</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultado.map((item) => (
                <TableRow key={item.vendedor.id}>
                  <TableCell>{item.vendedor.codigo}</TableCell>
                  <TableCell>{item.vendedor.nome}</TableCell>
                  <TableCell>{item.total_vendas}</TableCell>
                  <TableCell>{formatarMoeda(Number(item.total))}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                  Total de Comissões do Período
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{formatarMoeda(totalGeral)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </LocalizationProvider>
  );
}