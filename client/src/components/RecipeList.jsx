import { useNavigate, useOutletContext } from "react-router";
import LoginSignup from "../common/components/auth/LoginSignup";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import useFetch from "../common/utils/useFetch";
import { useEffect } from "react";

export default function RecipeList() {
  const { user } = useOutletContext();

  const {
    response: recipes,
    loading: recipesLoading,
    runFetch: searchRecipes,
  } = useFetch("recipes");

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      searchRecipes();
    }
  }, [user]);

  if (!user) {
    return <LoginSignup />;
  }

  return (
    <>
      <Grid container spacing={2}>
        {recipes?.map((recipe) => (
          <Grid size={4} key={"recipe-" + recipe.id}>
            <Card>
              <CardActionArea onClick={()=>navigate(`/recipes/${recipe.id}`)}>
                <CardHeader title={recipe.name} />
                <CardContent>
                  <Typography variant="body1">{recipe.description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
