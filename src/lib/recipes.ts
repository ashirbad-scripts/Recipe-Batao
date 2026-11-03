/**
 * Recipe data loading.
 * DATA SOURCE: src/data/recipes.csv — replace that file with your full CSV
 * (same columns) and the app picks it up automatically.
 */
import rawCsv from "@/data/recipes.csv?raw";
import { parseCSV } from "./csv";

export type Recipe = {
  id: string;
  name: string;
  ingredients: string[]; // with quantities (TranslatedIngredients)
  cleaned: string[]; // Cleaned-Ingredients
  time: number;
  cuisine: string;
  instructions: string;
  steps: string[];
  url: string;
  image: string;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type Row = Partial<Record<"TranslatedRecipeName" | "TranslatedIngredients" | "TotalTimeInMins" | "Cuisine" | "TranslatedInstructions" | "URL" | "Cleaned-Ingredients" | "image-url", string>>;

export function rowsToRecipes(rows: Row[]): Recipe[] {
  const seen = new Set<string>();
  return rows
    .filter((r) => r.TranslatedRecipeName)
    .map((r) => {
      const title = r.TranslatedRecipeName ?? "";
      let id = slug(title) || "recipe";
      while (seen.has(id)) id += "-x";
      seen.add(id);
      const instructions = r.TranslatedInstructions ?? "";
      return {
        id,
        name: title.replace(/\s*recipe$/i, "").trim(),
        ingredients: (r.TranslatedIngredients ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        cleaned: (r["Cleaned-Ingredients"] ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
        time: Number(r.TotalTimeInMins) || 0,
        cuisine: (r.Cuisine ?? "Other").replace(/\s*recipes?$/i, "").trim() || "Other",
        instructions,
        steps: instructions.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 3),
        url: r.URL ?? "",
        image: r["image-url"] ?? "",
      };
    });
}

let cache: Recipe[] | null = null;
export function loadRecipes(): Recipe[] {
  if (!cache) cache = rowsToRecipes(parseCSV(rawCsv));
  return cache;
}
export const getRecipe = (id: string) => loadRecipes().find((r) => r.id === id);
