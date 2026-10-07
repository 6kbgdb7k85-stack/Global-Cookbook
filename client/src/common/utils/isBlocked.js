export default function isBlocked(recipe, user) {
  if (!recipe || !user) {
    console.warn("Recipe or User not provided");
    return true;
  }
  return !!user.blocked_by.find(blocker=>blocker.id===recipe.user.id)
}
