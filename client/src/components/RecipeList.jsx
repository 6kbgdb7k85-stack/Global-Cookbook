import { useNavigate, useOutletContext } from "react-router";
import LoginSignup from "../common/components/auth/LoginSignup";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarTwoToneIcon from "@mui/icons-material/StarTwoTone";
import useFetch from "../common/utils/useFetch";
import { useEffect } from "react";
import isFavorite from "../common/utils/isFavoriteRecipe";

export default function RecipeList() {
  const { user, session } = useOutletContext();

  const {
    response: recipes,
    loading: recipesLoading,
    runFetch: searchRecipes,
  } = useFetch("recipes");

  const {
    response: favoriteRecipeResponse,
    runFetch: favoriteRecipe
  } = useFetch('users/:userId','PATCH',false)

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      searchRecipes();
    }
  }, [user]);

  useEffect(()=>{
    if(favoriteRecipeResponse){
      searchRecipes()
    }
  },[favoriteRecipeResponse])

  function handleFavorite(recipe){
    const payload={urlParams:{":userId":user.id}}
    if (isFavorite(user.id,recipe)){
      payload.unfavorite=recipe.id
    }else{
      payload.favorite=recipe.id
    }
    favoriteRecipe(payload)
  }

  if (!user) {
    return <LoginSignup />;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Grid container>
            <Grid size={"grow"}></Grid>
            <Grid size={1}>
              <Button
                variant="contained"
                onClick={() => navigate("/new-recipe")}
              >
                Create Recipe
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {recipes?.map((recipe) => (
          <Grid size={4} key={"recipe-" + recipe.id}>
            <Card>
              <CardActionArea onClick={() => navigate(`/recipes/${recipe.id}`)}>
                <CardHeader title={recipe.name} />
                <CardContent>
                  <Typography variant="body1">{recipe.description}</Typography>
                </CardContent>
              </CardActionArea>
              <CardContent sx={{textAlign:"right", p:"0 !important"}}>
                <IconButton color="primary" onClick={()=>handleFavorite(recipe)}>
                  {isFavorite(user?.id, recipe) ? (
                    <StarTwoToneIcon />
                  ) : (
                    <StarBorderIcon />
                  )}
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
