import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { Layout } from "./components/Layout";
import { VendasPage } from "./pages/VendasPage";
import { VendaFormPage } from "./pages/VendaFormPage";
import { ComissoesPage } from "./pages/ComissoesPage";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <CssBaseline />
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/vendas" replace />} />
            <Route path="/vendas" element={<VendasPage />} />
            <Route path="/vendas/nova" element={<VendaFormPage />} />
            <Route path="/vendas/:id/editar" element={<VendaFormPage />} />
            <Route path="/comissoes" element={<ComissoesPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}