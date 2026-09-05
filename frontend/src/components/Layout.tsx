import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
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

const paginas = [
  { titulo: "Vendas", caminho: "/vendas", icone: <ReceiptLongIcon /> },
  { titulo: "Comissões", caminho: "/comissoes", icone: <PaidIcon /> },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const paginaAtual = paginas.find((p) => location.pathname.startsWith(p.caminho));

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => setMenuAberto(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            {paginaAtual?.titulo ?? "Papelaria"}
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
    </>
  );
}