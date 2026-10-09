import {
  Button,
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
import FormWrapper from "../common/components/form/FormWrapper";
import { EDIT_PASSWORD_FIELDS, FIELD_TYPES } from "../common/constants";
import compilePayload from "../common/utils/compilePayload";
import validateForm from "../common/utils/validateForm";
import FormField from "../common/components/form/FormField";

const initPassForm = {
  old_password: "",
  password: "",
  confirm_pass: "",
};

export default function UserProfile() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(
    user || {
      recipe_default_private: false,
    },
  );
  const [editPass, setEditPass] = useState(false);
  const [passForm, setPassForm] = useState(initPassForm);
  const [passFormErrors, setPassFormErrors] = useState({});
  const [editUsername, setEditUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(null);

  const {
    response: userResponse,
    loading: userLoading,
    error: userError,
    runFetch: getUpdateUser,
  } = useFetch(`users/${user?.id}`);

  useEffect(() => {
    if (userResponse) {
      setUserData(userResponse);
      setEditPass(false);
      setPassForm(initPassForm);
      setPassFormErrors({});
    }
  }, [userResponse]);

  useEffect(() => {
    if (user) {
      setUserData(user);
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    if (userError?.field_error) {
      if (editPass) {
        setPassFormErrors(userError.field_error);
      }
      if (editUsername) {
        setUsernameError(userError.field_error);
      }
    }
  }, [userError]);

  function handleChange(e) {
    getUpdateUser({
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
      method: "PATCH",
    });
  }

  function handlePasswordChange({ name, value }) {
    const newPassForm = { ...passForm, [name]: value };
    setPassForm(newPassForm);
    setPassFormErrors(
      validateForm(newPassForm, EDIT_PASSWORD_FIELDS, { name, value }),
    );
  }

  function unblockUser(userId) {
    getUpdateUser({ unblock: userId, method: "PATCH" });
  }

  function togglePasswordEdit() {
    if (editPass) {
      setEditPass(false);
      setPassForm(initPassForm);
      setPassFormErrors({});
    } else {
      setEditPass(true);
    }
  }

  function toggleUsernameEdit() {
    if (editUsername) {
      setEditUsername(false);
      setUsername(user?.username || "");
      setUsernameError({});
    } else {
      setEditUsername(true);
    }
  }

  function handleUsernameChange({ name, value }) {
    setUsername(value);
    setUsernameError(
      validateForm(
        { username },
        [{ id: "username", required: true, type: FIELD_TYPES.TEXT }],
        { name, value },
      ),
    );
  }

  function handleSubmit(e, canceled) {
    if (canceled) {
      if (editPass) {
        togglePasswordEdit();
      } else {
        toggleUsernameEdit();
      }
    } else {
      if (editPass) {
        getUpdateUser({
          ...compilePayload(passForm, EDIT_PASSWORD_FIELDS),
          method: "PATCH",
        });
      } else {
        getUpdateUser({ username, method: "PATCH" });
      }
    }
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
      {!editPass && !editUsername && (
        <>
          <Button
            variant="contained"
            sx={{ mr: 1 }}
            onClick={togglePasswordEdit}
          >
            Change Password
          </Button>
          <Button variant="contained" onClick={toggleUsernameEdit}>
            Change Username
          </Button>
        </>
      )}
      {editPass && (
        <FormWrapper
          formData={passForm}
          fields={EDIT_PASSWORD_FIELDS}
          onChange={handlePasswordChange}
          formErrors={passFormErrors}
          edit={editPass}
          canEdit={true}
          colSpan={12}
          onSubmit={handleSubmit}
          setEdit={togglePasswordEdit}
          submitLabel={"Confirm Password Change"}
        />
      )}
      {editUsername && (
        <FormWrapper
          formData={{ username }}
          fields={[
            {
              id: "username",
              label: "New Username",
              type: FIELD_TYPES.TEXT,
              required: true,
            },
          ]}
          onChange={handleUsernameChange}
          formErrors={usernameError || {}}
          edit={editUsername}
          canEdit={true}
          colSpan={12}
          onSubmit={handleSubmit}
          setEdit={toggleUsernameEdit}
          submitLabel={"Confirm Username Change"}
        />
      )}
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
