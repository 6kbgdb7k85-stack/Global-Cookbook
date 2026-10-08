import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import useFetch from "../common/utils/useFetch";
import { useNavigate, useOutletContext, useParams } from "react-router";
import Comment from "./Comment";
import { useEffect, useState } from "react";
import FormWrapper from "../common/components/form/FormWrapper";
import { RECIPE_FIELDS } from "../common/constants";
import compilePayload from "../common/utils/compilePayload";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarTwoToneIcon from "@mui/icons-material/StarTwoTone";
import DeleteIcon from "@mui/icons-material/Delete";
import isFavorite from "../common/utils/isFavoriteRecipe";
import DialogWrapper from "../common/components/DialogWrapper";
import isBlocked from "../common/utils/isBlocked";

export default function RecipeView() {
  const [comments, setComments] = useState([]);
  const [edit, setEdit] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { recipeId } = useParams();

  const { user } = useOutletContext();

  const navigate = useNavigate();

  const {
    response: recipeResponse,
    loading: recipeLoading,
    error: recipeError,
    setError: setRecipeError,
    runFetch: updateRecipe,
  } = useFetch(`recipes/${recipeId}`);

  const {
    response: createRecipeResponse,
    loading: createRecipeLoading,
    error: createRecipeError,
    runFetch: createRecipe,
  } = useFetch("recipes", "POST", false);

  const {
    response: commentsResponse,
    loading: commentsLoading,
    runFetch: getComments,
  } = useFetch(`recipes/${recipeId}/comments`);

  const { response: favoriteRecipeResponse, runFetch: favoriteRecipe } =
    useFetch("users/:userId", "PATCH", false);

  useEffect(() => {
    if (!recipeId) {
      setEdit(true);
      setRecipe({
        name: "",
        description: "",
        ingredients: "",
        instructions: "",
        private: user?.recipe_default_private,
      });
    }
  }, []);

  useEffect(() => {
    if (user && !recipeId) {
      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        private: user.recipe_default_private,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (commentsResponse) {
      setComments(commentsResponse);
    }
  }, [commentsResponse]);

  useEffect(() => {
    if (recipeResponse) {
      setRecipe(recipeResponse);
      setEdit(false);
      setRecipeError(null);
    }
  }, [recipeResponse]);

  useEffect(() => {
    if (favoriteRecipeResponse) {
      updateRecipe();
    }
  }, [favoriteRecipeResponse]);

  useEffect(() => {
    if (createRecipeResponse) {
      setRecipe(createRecipeResponse);
      setEdit(false);
      navigate(`/recipes/${createRecipeResponse.id}`);
    }
  }, [createRecipeResponse]);

  function handleSave(e, cancel = false) {
    if (cancel) {
      if (recipe.id) {
        setRecipe(recipeResponse);
      } else {
        navigate("/");
      }
    } else {
      if (!recipe) {
        return;
      }
      if (recipe.id) {
        updateRecipe({
          ...compilePayload(recipe, RECIPE_FIELDS),
          method: "PATCH",
        });
      } else {
        createRecipe(compilePayload(recipe, RECIPE_FIELDS));
      }
    }
  }

  function handleChange({ name, value }) {
    if (name === "private" && !edit) {
      updateRecipe({ private: value, method: "PATCH" });
    }
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      [name]: value,
    }));
  }

  function toggleFavorite() {
    if (!user) {
      return;
    }
    const payload = { urlParams: { ":userId": user.id } };
    if (isFavorite(user.id, recipe)) {
      payload.unfavorite = recipe.id;
    } else {
      payload.favorite = recipe.id;
    }
    favoriteRecipe(payload);
  }

  function handleDelete(e) {
    if (e.target.name == "confirm") {
      updateRecipe({ method: "DELETE" });
      navigate("/");
    }
    setDialogOpen(false);
  }

  if (recipeError?.action) {
    return (
      <>
        <Typography variant="h5">
          This recipe has been marked as private by its creator.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </>
    );
  }

  return (
    <Box sx={{ mx: "auto", width: 0.5 }}>
      <>
        <DialogWrapper
          title={"Delete Recipe?"}
          message={
            "Are you sure you want to delete this recipe? This action cannot be undone."
          }
          onClose={handleDelete}
          open={dialogOpen}
        />
        <Grid container>
          <Grid size={1} />
          <Grid size={"grow"} sx={{ textAlign: "center" }}>
            <Typography variant="h4">Recipe Details</Typography>
          </Grid>
          <Grid size={1} sx={{ textAlign: "right" }}>
            {recipe?.user?.id === user?.id && !recipeLoading && (
              <IconButton onClick={() => setDialogOpen(true)} color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
        <FormWrapper
          fields={RECIPE_FIELDS}
          formData={recipe || {}}
          formErrors={
            recipe?.id
              ? recipeError?.field_error || {}
              : createRecipeError?.field_error || {}
          }
          canEdit={user?.id == recipe?.user?.id}
          edit={edit}
          onChange={handleChange}
          onSubmit={handleSave}
          setEdit={setEdit}
          loading={recipeLoading}
        />
        {recipe?.id && !recipeLoading && (
          <IconButton color="primary" onClick={toggleFavorite}>
            {isFavorite(user?.id, recipe) ? (
              <StarTwoToneIcon />
            ) : (
              <StarBorderIcon />
            )}
          </IconButton>
        )}
        {recipe?.id && (
          <>
            {commentsLoading ? (
              <Box sx={{ mt: "1rem" }}>
                <Stack spacing={1}>
                  <Skeleton variant="rectangular" width={"100%"} height={75} />
                  <Skeleton variant="rectangular" width={"100%"} height={75} />
                  <Skeleton variant="rectangular" width={"100%"} height={75} />
                </Stack>
              </Box>
            ) : (
              <>
                {!isBlocked(recipe, user) && (
                  <Comment
                    key={"new-comment"}
                    comment={{ text: "" }}
                    canChange={true}
                    onServerUpdate={getComments}
                    isNew
                  />
                )}
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    canChange={comment.user.id === user?.id}
                    onServerUpdate={getComments}
                  />
                ))}
              </>
            )}
          </>
        )}
      </>
    </Box>
  );
}
