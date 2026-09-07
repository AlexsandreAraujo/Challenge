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
import { VendasIcon } from "./icons/VendasIcon";
import { ComissoesIcon } from "./icons/ComissoesIcon";
import logo from "../assets/logo.svg";
import { cores } from "../theme";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const paginas = [
  { titulo: "Vendas", caminho: "/vendas", icone: <VendasIcon fontSize="small"/> },
  { titulo: "Comissões", caminho: "/comissoes", icone: <ComissoesIcon fontSize="small"/> },
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
        <Toolbar sx={{ position: "relative" }}>
          <IconButton edge="start" color="primary" onClick={() => setMenuAberto(true)}>
            <MenuIcon />
          </IconButton>
          <img src={logo} alt="Logo" height={56} style={{ marginLeft: 8, marginRight: 16 }} />
          <Typography
            variant="h4"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              color: "primary.light",
              fontWeight: "bold",
            }}
          >
            {titulo}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={menuAberto}
        onClose={() => setMenuAberto(false)}
        slotProps={{ paper: { sx: { width: 240, bgcolor: cores.fundoMenu } } }}
      >
        <List sx={{ width: 240 }}>
          {paginas.map((pagina) => (
            <ListItemButton
              key={pagina.caminho}
              component={Link}
              to={pagina.caminho}
              onClick={() => setMenuAberto(false)}
              sx={{
                bgcolor: cores.fundoItemMenu,
                mt: 1,
                "& .MuiListItemIcon-root": { color: "primary.light" },
                "& .MuiListItemText-primary": { color: "primary.light", fontWeight: "bold" },
              }}
            >
              <ListItemIcon>{pagina.icone}</ListItemIcon>
              <ListItemText primary={pagina.titulo} />
              <ChevronRightIcon sx={{ ml: "auto", color: "action.disabled" }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <main style={{ padding: 24 }}>{children}</main>
    </TituloContext.Provider>
  );
}