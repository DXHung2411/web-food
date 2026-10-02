// Dữ liệu công thức nằm ở js/content/recipes.js (sửa bằng `npm run admin` hoặc sửa tay). File này chỉ có hàm tiện ích.
import recipes from './content/recipes.js'

export const RECIPES = recipes
export const recipeCost = (r) => r.ingredients.reduce((sum, i) => sum + i.cost, 0)
export const recipeById = (id) => RECIPES.find((r) => r.id === id)
