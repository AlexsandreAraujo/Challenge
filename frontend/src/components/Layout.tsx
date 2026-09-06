import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaidIcon from "@mui/icons-material/Paid";
import logo from "../assets/logo.svg";

const paginas = [
  { titulo: "Vendas", caminho: "/vendas", icone: <ReceiptLongIcon /> },
  { titulo: "Comissões", caminho: "/comissoes", icone: <PaidIcon /> },
];

const TituloContext = createContext<(titulo: string) => void>(() => {});

interface TituloProps {
  texto: string;
}

/** Componente sem saída visual: define o título exibido no header (AppBar). */
export function Titulo({ texto }: TituloProps) {
  const setTitulo = useContext(TituloContext);
  useEffect(() => {
    setTitulo(texto);
  }, [texto, setTitulo]);
  return null;
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [titulo, setTitulo] = useState("Papelaria");

  return (
    <TituloContext.Provider value={setTitulo}>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => setMenuAberto(true)}>
            <MenuIcon />
          </IconButton>
          <img src={logo} alt="Logo" height={32} style={{ marginLeft: 8, marginRight: 16 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            {titulo}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={menuAberto} onClose={() => setMenuAberto(false)}>
        <List sx={{ width: 240 }}>
          {paginas.map((pagina) => (
            <ListItemButton
              key={pagina.caminho}
              component={Link}
              to={pagina.caminho}
              onClick={() => setMenuAberto(false)}
            >
              <ListItemIcon>{pagina.icone}</ListItemIcon>
              <ListItemText primary={pagina.titulo} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <main style={{ padding: 24 }}>{children}</main>
    </TituloContext.Provider>
  );
}