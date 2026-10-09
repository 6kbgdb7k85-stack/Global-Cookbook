import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import LoginSignup from "../common/components/auth/LoginSignup";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarTwoToneIcon from "@mui/icons-material/StarTwoTone";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import useFetch from "../common/utils/useFetch";
import { useEffect, useState } from "react";
import isFavorite from "../common/utils/isFavoriteRecipe";

export default function RecipeList() {
  const { user, session } = useOutletContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchMode, setSearchMode] = useState(searchParams["mode"] || "all");

  const {
    response: recipes,
    loading: recipesLoading,
    runFetch: searchRecipes,
  } = useFetch("recipes");

  const { response: favoriteRecipeResponse, runFetch: favoriteRecipe } =
    useFetch("users/:userId", "PATCH", false);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      searchRecipes();
    }
  }, [user]);

  useEffect(()=>{
    if(searchParams.size==0){
      changeSearchMode()
    }
  },[searchParams])

  useEffect(() => {
    if (favoriteRecipeResponse) {
      searchRecipes();
    }
  }, [favoriteRecipeResponse]);

  function handleFavorite(recipe) {
    const payload = { urlParams: { ":userId": user.id } };
    if (isFavorite(user.id, recipe)) {
      payload.unfavorite = recipe.id;
    } else {
      payload.favorite = recipe.id;
    }
    favoriteRecipe(payload);
  }

  function changeSearchMode(newMode) {
    setSearchMode(newMode || "all");
    setSearchParams(
      (prevParams) => {
        prevParams.set("mode", newMode || "all");
        return prevParams;
      },
      { replace: true, preventScrollReset: true },
    );
    searchRecipes({
      searchParams: {
        text: searchParams.get("text") || "",
        mode: newMode || "all",
      },
    });
  }

  function handleSearch(e) {
    e.preventDefault();
    searchRecipes({
      searchParams: {
        text: searchParams.get("text") || "",
        mode: searchParams.get("mode") || "all",
      },
    });
  }

  function resetSearch() {
    setSearchParams((prevParams) => {
      (prevParams.delete("text"), { replace: true, preventScrollReset: true });
    });
    searchRecipes({
      searchParams: {
        mode: searchParams.get("mode") || "all",
      },
    });
  }

  if (!user) {
    return <LoginSignup />;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12} sx={{ textAlign: "right" }}>
          <ToggleButtonGroup
            color="primary"
            value={searchMode}
            exclusive
            onChange={(e, newMode) => changeSearchMode(newMode)}
            sx={{mr:1}}
          >
            <ToggleButton value={"all"}>All</ToggleButton>
            <ToggleButton value={"fave"}>My Favorites</ToggleButton>
            <ToggleButton value={"own"}>My Recipes</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" onClick={() => navigate("/new-recipe")}>
            Create Recipe
          </Button>
        </Grid>
        <Grid size={12}>
          <Grid container sx={{ alignItems: "center" }}>
            <Grid size={12}>
              <form onSubmit={handleSearch}>
                <TextField
                  name="text"
                  id="search-by-text"
                  value={searchParams.get("text") || ""}
                  label="Search"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <>
                          {searchParams.get("text") && (
                            <IconButton onClick={resetSearch}>
                              <ClearIcon />
                            </IconButton>
                          )}
                          <SearchIcon />
                        </>
                      ),
                    },
                  }}
                  onBlur={() => console.log("test")}
                  sx={{ width: "100%" }}
                  onChange={(e) =>
                    setSearchParams(
                      (prevParams) => {
                        prevParams.set("text", e.target.value);
                        return prevParams;
                      },
                      { replace: true, preventScrollReset: true },
                    )
                  }
                />
              </form>
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
              <CardContent sx={{ textAlign: "right", p: "0 !important" }}>
                <IconButton
                  color="primary"
                  onClick={() => handleFavorite(recipe)}
                >
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
