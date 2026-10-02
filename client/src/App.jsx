import { AccountCircle } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import useFetch from "./common/utils/useFetch";

function App() {
  const [user, setUser] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const {
    response: session,
    loading: sessionLoading,
    error: sessionError,
    runFetch: getSession
  } = useFetch("me");

  const navigate = useNavigate()

  useEffect(()=>{
    if(session){
      setUser(session)
    }
  },[session])

  function toggleMenu(e = {}) {
    setMenuAnchor(menuAnchor ? false : e.currentTarget);
  }

  function logout(){
    navigate('/')
    setUser(null)
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h3" sx={{ flexGrow: 1 }}>
              Global Cookbook
            </Typography>
            {user && (
              <>
                <IconButton color="inherit" size="large" onClick={toggleMenu}>
                  <AccountCircle fontSize="inherit" />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={toggleMenu}
                >
                  <MenuItem onClick={()=>navigate('/profile')}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={logout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <Outlet context={{user,setUser,getSession,session}} />
    </>
  );
}

export default App;
