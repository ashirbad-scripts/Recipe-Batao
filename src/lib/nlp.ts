import type { Recipe } from "./recipes";

const STOP = new Set("a an the and or with for of to in on my me i want some something make cook recipe recipes dish that is are can please like under less than within minutes mins min hour hours".split(" "));

export const stem = (w: string) => w.replace(/(ies)$/, "y").replace(/(es|s)$/, "");
export const tokenize = (s: string) =>
  s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);

// Concept expansion: lightweight "semantic" bridge between intent words and ingredients.
const CONCEPTS: Record<string, string[]> = {
  spicy: ["chilli", "chili", "pepper", "masala", "green"],
  hot: ["chilli", "pepper"],
  creamy: ["cream", "butter", "milk", "coconut", "cheese"],
  healthy: ["vegetable", "tofu", "zucchini", "carrot", "cabbage", "chickpea"],
  protein: ["egg", "paneer", "tofu", "chana", "chickpea", "dal"],
  breakfast: ["egg", "dosa", "pav", "lassi"],
  drink: ["lassi", "milk", "mango"],
  sweet: ["sugar", "mango", "cardamom"],
  dessert: ["sugar", "mango", "cardamom"],
  vegan: ["tofu", "vegetable", "coconut"],
  noodle: ["hakka", "noodle"],
  rice: ["rice", "biryani", "pulao"],
  cheesy: ["cheese", "paneer", "parmesan"],
  curry: ["curry", "masala", "gravy"],
};

export type ParsedQuery = { text: string; maxTime?: number | undefined; exclude: string[] };

export function parseQuery(q: string): ParsedQuery {
  let text = q.toLowerCase();
  let maxTime: number | undefined;
  const t = text.match(/(?:under|less than|within|in|max|below|<)\s*(\d+)\s*(h|hr|hrs|hour|hours|m|min|mins|minutes?)\b/);
  if (t) {
    maxTime = Number(t[1]) * (/^h/.test(t[2] ?? "") ? 60 : 1);
    text = text.replace(t[0], " ");
  } else if (/\b(quick|fast|easy)\b/.test(text)) maxTime = 30;
  const exclude: string[] = [];
  text = text.replace(/\b(?:without|no|exclude|excluding|minus)\s+([a-z\s]+?)(?=\s+(?:with|under|in|less|within)\b|[,.]|$)/g, (_m, list: string) => {
    list.split(/\s+(?:or|and|nor)\s+|\s*,\s*/).map((s) => s.trim()).filter(Boolean).forEach((s) => exclude.push(s));
    return " ";
  });
  return { text: text.replace(/\b(quick|fast|easy)\b/g, " ").replace(/\s+/g, " ").trim(), maxTime, exclude };
}

export function recipeHasIngredient(r: Recipe, ing: string) {
  const s = stem(ing.toLowerCase());
  return r.cleaned.some((c) => c.includes(s)) || r.ingredients.some((c) => c.toLowerCase().includes(s));
}

type Index = { docs: Map<string, number>[]; idf: Map<string, number> };
const indexCache = new WeakMap<Recipe[], Index>();

function buildIndex(recipes: Recipe[]): Index {
  const docs = recipes.map((r) => {
    const tf = new Map<string, number>();
    const add = (s: string, w: number) => tokenize(s).forEach((t) => tf.set(t, (tf.get(t) ?? 0) + w));
    add(r.name, 3); add(r.cuisine, 2); add(r.cleaned.join(" "), 1.5); add(r.instructions, 0.3);
    return tf;
  });
  const df = new Map<string, number>();
  docs.forEach((d) => d.forEach((_v, k) => df.set(k, (df.get(k) ?? 0) + 1)));
  const idf = new Map<string, number>();
  df.forEach((v, k) => idf.set(k, Math.log(1 + recipes.length / v)));
  return { docs, idf };
}

/** TF-IDF cosine similarity with concept expansion. Returns score 0..1 per recipe. */
export function semanticScores(recipes: Recipe[], text: string): number[] {
  let idx = indexCache.get(recipes);
  if (!idx) { idx = buildIndex(recipes); indexCache.set(recipes, idx); }
  const q = new Map<string, number>();
  for (const t of tokenize(text)) {
    q.set(t, (q.get(t) ?? 0) + 1);
    (CONCEPTS[t] ?? []).forEach((c) => q.set(stem(c), (q.get(stem(c)) ?? 0) + 0.6));
  }
  if (!q.size) return recipes.map(() => 0);
  const { docs, idf } = idx;
  const qv = [...q].map(([k, v]) => [k, v * (idf.get(k) ?? 0)] as const);
  const qn = Math.hypot(...qv.map(([, v]) => v)) || 1;
  return docs.map((d) => {
    let dot = 0, dn = 0;
    d.forEach((v, k) => { const w = v * (idf.get(k) ?? 0); dn += w * w; });
    for (const [k, v] of qv) dot += v * (d.get(k) ?? 0) * (idf.get(k) ?? 0);
    return dn ? dot / (qn * Math.sqrt(dn)) : 0;
  });
}

export function pantryMatch(r: Recipe, pantry: string[]) {
  const ignore = /^(salt|water|oil|ice cubes)$/;
  const needed = r.cleaned.filter((c) => !ignore.test(c));
  const p = pantry.map((x) => stem(x.toLowerCase().trim())).filter(Boolean);
  const have = needed.filter((c) => p.some((x) => c.includes(x) || x.includes(stem(c))));
  return {
    percent: needed.length ? Math.round((have.length / needed.length) * 100) : 100,
    missing: needed.filter((c) => !have.includes(c)),
  };
}
