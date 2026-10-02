import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router";
import UserProfile from "./components/UserProfile.jsx";
import RecipeList from "./components/RecipeList.jsx";
import RecipeView from "./components/RecipeView.jsx";
import ProtectedRoute from "./common/components/ProtectedRoute.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
        <Route index element={<RecipeList />} />
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<UserProfile />} />
            <Route path="recipes/:recipeId" element={<RecipeView />} />
            <Route path="new-recipe" element={<RecipeView/>}/>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
