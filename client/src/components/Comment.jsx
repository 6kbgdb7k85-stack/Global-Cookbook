import {
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import FormField from "../common/components/form/FormField";
import { FIELD_TYPES, MUI_TYPOGRAPHY_SIZES } from "../common/constants";
import useFetch from "../common/utils/useFetch";
import DialogWrapper from "../common/components/DialogWrapper";

export default function Comment({
  comment,
  canChange,
  onServerUpdate = () => {},
  isNew = false,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [commentText, setCommentText] = useState(comment.text);
  const [edit, setEdit] = useState(isNew);
  const [dialog, setDialog] = useState(null);
  const dialogConfig = {
    titles: {
      delete: "Delete Comment?",
      block: `Block User ${comment.user?.username}`,
    },
    messages: {
      delete:
        "You are about to delete your comment. This action cannot be undone. Continue?",
      block: `By blocking ${comment.user?.username}, you will no longer see their comments and they will not be able to add new comments to your recipes. Already existing comments are not affected. You can manage your blocked users in your profile. Continue?`,
    },
  };

  const { recipeId } = useParams();
  const { user } = useOutletContext();

  const {
    response: updateDeleteCommentResponse,
    runFetch: updateDeleteComment,
    error: updateCommentError,
    setError: setUpdateCommentError,
  } = useFetch(`comments/${comment.id}`, "PATCH", false);

  const {
    response: createCommentResponse,
    runFetch: createComment,
    error: createCommentError,
    setError: setCreateCommentError,
  } = useFetch(`recipes/${recipeId}/comments`, "POST", false);

  const {
    response: blockUserResponse,
    loading: blockUserLoading,
    runFetch: blockUser,
  } = useFetch("users/:userId", "PATCH", false);

  useEffect(() => {
    if (updateDeleteCommentResponse) {
      if (updateDeleteCommentResponse?.id) {
        setEdit(false);
        setCommentText(updateDeleteCommentResponse.text);
        setUpdateCommentError(null);
      } else {
        onServerUpdate();
      }
    }
  }, [updateDeleteCommentResponse]);

  useEffect(() => {
    if (createCommentResponse) {
      onServerUpdate();
      setCommentText(comment.text);
      setCreateCommentError(null);
    }
  }, [createCommentResponse]);

  function toggleMenu(e = {}) {
    setMenuAnchor(menuAnchor ? null : e.currentTarget);
  }

  function handleChange({ value }) {
    setCommentText(value);
  }

  function doAction(action) {
    setMenuAnchor(null);
    switch (action) {
      case "edit":
        setEdit(true);
        break;
      case "delete":
        setDialog("delete");
        break;
      case "block":
        setDialog("block");
        break;
      case "save":
        if (comment.id) {
          updateDeleteComment({ text: commentText });
        } else {
          createComment({ text: commentText });
        }
        break;
      default:
        console.warn("Invalid Menu Action");
    }
  }

  function handleDialogAction(e) {
    if (e.target.name === "confirm") {
      if (dialog === "delete") {
        updateDeleteComment({ method: "DELETE" });
      } else if (dialog === "block") {
        if (!user) {
          return;
        }
        blockUser({
          block: comment.user.id,
          urlParams: { ":userId": user.id },
        });
        onServerUpdate();
      }
    }
    setDialog(null);
  }

  return (
    <Box sx={{ mt: "1rem" }}>
      <DialogWrapper
        title={dialogConfig.titles[dialog]}
        message={dialogConfig.messages[dialog]}
        onClose={handleDialogAction}
        open={!!dialog}
      />
      <Grid container spacing={0}>
        <Grid size={11}>
          <Stack direction={"row"}>
            <Typography variant="body1">
              {comment.user?.username} {comment.created_time}
            </Typography>
          </Stack>
        </Grid>
        <Grid size={1} sx={{ textAlign: "right" }}>
          {!isNew && (
            <>
              <IconButton
                aria-label={`comment=${comment.id}-actions`}
                size={"small"}
                onClick={toggleMenu}
              >
                <MoreVertIcon fontSize="inherit" />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={toggleMenu}
              >
                {canChange ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        doAction("delete");
                      }}
                    >
                      Delete
                    </MenuItem>
                  </>
                ) : (
                  <></>
                )}
                {user?.id !== comment.user?.id ? (
                  <MenuItem onClick={() => doAction("block")}>
                    Block {comment.user?.username}
                  </MenuItem>
                ) : (
                  <></>
                )}
              </Menu>
            </>
          )}
        </Grid>
        <Grid size={11}>
          <FormField
            field={{
              id: "text",
              type: FIELD_TYPES.TEXTAREA,
              size: MUI_TYPOGRAPHY_SIZES.BODY2,
            }}
            value={commentText}
            onChange={handleChange}
            edit={edit}
            error={isNew ? createCommentError?.field_error?.text : updateCommentError?.field_error?.text}
          />
        </Grid>
        <Grid size={1}>
          {edit ? (
            <Stack>
              <Button onClick={() => doAction("save")}>
                {isNew ? "Post" : "Save"}
              </Button>
              {!isNew && (
                <Button
                  onClick={() => {
                    setEdit(false);
                    setCommentText(comment.text);
                  }}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          ) : (
            <>
              {canChange && (
                <Button onClick={() => doAction("edit")}>Edit</Button>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
