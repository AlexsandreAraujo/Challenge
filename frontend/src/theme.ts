import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#00585E",
      light: "#2B7D83",
    },
},
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export const cores = {
  bordaTabela: "#888888",
  hoverExcluir: "#EEC5C4",
  fundoMenu: "#F2F2F2",
  fundoItemMenu: "#F8F8F8",
};