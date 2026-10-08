import { AccountCircle } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  ThemeProvider,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import useFetch from "./common/utils/useFetch";
import AlertWrapper from "./common/components/AlertWrapper";
import { cookbookTheme } from "./common/styling/themes";

function App() {
  const [user, setUser] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [theme, setTheme] = useState(cookbookTheme);

  const {
    response: session,
    loading: sessionLoading,
    error: sessionError,
    runFetch: getSession,
  } = useFetch("me");

  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      setUser(session);
    }
  }, [session]);

  useEffect(() => {
    if (sessionError) {
      navigate("/");
      setUser(null);
      localStorage.removeItem("token");
    }
  }, [sessionError]);

  useEffect(() => {
    if (alerts.length === 0) return;
    const intervalId = setInterval(() => {
      setAlerts((prevState) =>
        prevState
          .map((alert) => ({
            ...alert,
            timeRemaining: alert.timeRemaining - 1,
          }))
          .filter((alert) => alert.timeRemaining > 0),
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [alerts.length]);

  function addAlert(alert) {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }

  function toggleMenu(e = {}) {
    setMenuAnchor(menuAnchor ? false : e.currentTarget);
  }

  function logout() {
    navigate("/");
    setUser(null);
    localStorage.removeItem("token");
    setMenuAnchor(false);
  }

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth={"100%"}
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100dvh",
        }}
      >
        <Box sx={{ flexGrow: 1, mb: "1rem" }}>
          <AppBar position="static">
            <Toolbar>
              <Typography
                variant="h3"
                sx={{ flexGrow: 1 }}
                onClick={() => navigate("/")}
                sx={{
                  ":hover": { cursor: "pointer" },
                }}
              >
                Global Cookbook
              </Typography>
              {user && (
                <Box sx={{ textAlign: "right", flexGrow: 1 }}>
                  <IconButton color="inherit" size="large" onClick={toggleMenu}>
                    <AccountCircle fontSize="inherit" />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={toggleMenu}
                  >
                    <MenuItem
                      onClick={() => {
                        setMenuAnchor(false);
                        navigate("/profile");
                      }}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                  </Menu>
                </Box>
              )}
            </Toolbar>
          </AppBar>
        </Box>
        {alerts.map((alert) => (
          <AlertWrapper
            key={"alert-" + alert.id}
            severity={alert.severity}
            message={alert.message}
          />
        ))}
        <Outlet context={{ user, setUser, getSession, session, addAlert }} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
