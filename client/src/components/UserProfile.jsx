import {
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Switch,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate, useOutletContext } from "react-router";
import useFetch from "../common/utils/useFetch";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(user || {});

  const {
    response: userResponse,
    loading: userLoading,
    error: userError,
    runFetch: getUpdateUser,
  } = useFetch(`users/${user?.id}`);

  useEffect(() => {
    if (userResponse) {
      setUserData(userResponse);
    }
  }, [userResponse]);

  function handleChange(e) {
    getUpdateUser({
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
      method: "PATCH",
    });
  }

  function unblockUser(userId) {
    getUpdateUser({ unblock: userId, method: "PATCH" });
  }

  if (!userData) {
    return <></>;
  }

  return (
    <>
      <Typography variant="h2">{userData.username}</Typography>
      <FormControlLabel
        label={"New Recipes Private by Default"}
        control={
          <Switch
            checked={userData.recipe_default_private}
            id="recipe_default_private"
            name="recipe_default_private"
            onChange={handleChange}
          />
        }
      />

      <Typography variant="h6">Blocked Users</Typography>
      <List>
        {userData.blocking?.map((blockedUser) => (
          <ListItem
            key={blockedUser.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => unblockUser(blockedUser.id)}
              >
                <ClearIcon />
              </IconButton>
            }
          >
            <ListItemText primary={blockedUser.username} />
          </ListItem>
        ))}
      </List>
    </>
  );
}
