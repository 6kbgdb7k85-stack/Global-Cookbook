import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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

export default function RecipeView() {
  const [comments, setComments] = useState([]);
  const [edit, setEdit] = useState(false);
  const [recipe, setRecipe] = useState({});
  const { recipeId } = useParams();

  const { user } = useOutletContext();

  const navigate = useNavigate();

  const {
    response: recipeResponse,
    loading: recipeLoading,
    runFetch: updateRecipe,
  } = useFetch(`recipes/${recipeId}`);

  const {
    response: commentsResponse,
    loading: commentsLoading,
    runFetch: getComments,
  } = useFetch(`recipes/${recipeId}/comments`);

  const {
    response: createRecipeResponse,
    loading: createRecipeLoading,
    runFetch: createRecipe,
  } = useFetch("recipes", "POST", false);

  useEffect(() => {
    if (!recipeId) {
      setEdit(true);
    }
  }, []);

  useEffect(() => {
    if (commentsResponse) {
      setComments(commentsResponse);
    }
  }, [commentsResponse]);

  useEffect(() => {
    if (recipeResponse) {
      setRecipe(recipeResponse);
      setEdit(false);
    }
  }, [recipeResponse]);

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

  function handleChange(e, boolean = false) {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      [e.target.name]: boolean ? e.target.checked : e.target.value,
    }));
  }

  return (
    <Box sx={{ mx: "auto", width: 0.5 }}>
      <FormWrapper
        fields={RECIPE_FIELDS}
        formData={recipe || {}}
        formErrors={{}}
        canEdit={user?.id == recipe?.user?.id}
        edit={edit}
        onChange={handleChange}
        onSubmit={handleSave}
        setEdit={setEdit}
      />
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
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} loading={true} />
          ))}
        </>
      )}
    </Box>
  );
}
