export default function isFavorite(userId,recipe) {
    if(!userId||!recipe){
      return
    }
    const favIds = recipe.favorite_users.map((favUser) => favUser.id);
    return favIds.includes(userId);
  }