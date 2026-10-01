import { useOutletContext } from "react-router";
import LoginSignup from "../common/components/auth/LoginSignup";

export default function RecipeList() {
  const { user } = useOutletContext();

  if (!user) {
    return <LoginSignup />;
  }

  return (
    <>
      <h2>Recipe List Component</h2>
    </>
  );
}
