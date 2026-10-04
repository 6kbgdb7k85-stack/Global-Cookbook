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

export default function Comment({ comment, canChange, onServerUpdate=()=>{}, isNew = false }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [commentText, setCommentText] = useState(comment.text);
  const [edit, setEdit] = useState(isNew);

  const { recipeId } = useParams();
  const { user } = useOutletContext();

  const {
    response: updateDeleteCommentResponse,
    runFetch: updateDeleteComment,
  } = useFetch(`comments/${comment.id}`, "PATCH", false);

  const { response: createCommentResponse, runFetch: createComment } = useFetch(
    `recipes/${recipeId}/comments`,
    "POST",
    false,
  );

  useEffect(() => {
    if (updateDeleteCommentResponse) {
      if (updateDeleteCommentResponse?.id) {
        setEdit(false);
        setCommentText(updateDeleteCommentResponse.text);
      }else{
        onServerUpdate()
      }
    }
  }, [updateDeleteCommentResponse]);

  useEffect(() => {
    if (createCommentResponse) {
      onServerUpdate();
      setCommentText(comment.text);
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
        updateDeleteComment({ method: "DELETE" });
        break;
      case "block":
        console.log(action);
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

  return (
    <Box sx={{ mt: "1rem" }}>
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
            helper
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
            <Button onClick={() => doAction("edit")}>Edit</Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
