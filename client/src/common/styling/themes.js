import { createTheme } from "@mui/material";

const cookbookOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#7189a6",
    },
    secondary: {
      main: "#a99bb8",
    },
    text: {
      primary: "#26364a",
      secondary: "#647184",
      disabled: "#a8afb8",
    },
    divider: "#d8d0c4",
    background: {
      default: "#f7f3ea",
      paper: "#fffdf8",
    },
  },
};

export const cookbookTheme = createTheme(cookbookOptions);
