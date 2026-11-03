import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { loadRecipes } from "@/lib/recipes";
import { parseQuery, pantryMatch, recipeHasIngredient, semanticScores } from "@/lib/nlp";
import { useFavorites, usePantry } from "@/lib/storage";
import { RecipeCard } from "@/components/RecipeCard";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Recipe Bolo — Find recipes in plain language" },
      { name: "description", content: "Semantic recipe search, pantry matching, substitutions and a step-by-step cooking mode." },
      { property: "og:title", content: "Recipe Bolo — Find recipes in plain language" },
      { property: "og:description", content: "Semantic recipe search, pantry matching, substitutions and a step-by-step cooking mode." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EXAMPLES = ["spicy rice under 30 minutes", "creamy curry without onion", "quick protein breakfast", "noodles no garlic"];

function Index() {
  const recipes = loadRecipes();
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [time, setTime] = useState(0);
  const [pantryInput, setPantryInput] = useState("");
  const [pantry, setPantry] = usePantry();
  const [favs, setFavs] = useFavorites();
  const cuisines = useMemo(() => ["All", ...new Set(recipes.map((r) => r.cuisine))], [recipes]);
  const parsed = useMemo(() => parseQuery(q), [q]);

  const results = useMemo(() => {
    const scores = semanticScores(recipes, parsed.text);
    const maxT = Math.min(time || Infinity, parsed.maxTime ?? Infinity);
    return recipes
      .map((r, i) => ({ r, score: scores[i] ?? 0, match: pantry.length ? pantryMatch(r, pantry) : undefined }))
      .filter(({ r, score }) =>
        (cuisine === "All" || r.cuisine === cuisine) && r.time <= maxT &&
        !parsed.exclude.some((e) => recipeHasIngredient(r, e)) && (!parsed.text || score > 0.02))
      .sort((a, b) => (parsed.text ? b.score - a.score : 0) || (b.match?.percent ?? 0) - (a.match?.percent ?? 0));
  }, [recipes, parsed, cuisine, time, pantry]);

  const addPantry = () => {
    const items = pantryInput.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s && !pantry.includes(s));
    if (items.length) setPantry([...pantry, ...items]);
    setPantryInput("");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="max-w-2xl font-display text-4xl leading-tight md:text-5xl">What do you feel like cooking?</h1>
          <p className="mt-2 opacity-80">Describe it the way you'd say it — time limits and "without …" are understood.</p>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-background px-4 py-3 text-foreground">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. spicy rice under 30 minutes without tomato"
              className="w-full bg-transparent outline-none" aria-label="Search recipes" />
            {q && <button onClick={() => setQ("")} aria-label="Clear"><X className="h-4 w-4" /></button>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {EXAMPLES.map((e) => (
              <button key={e} onClick={() => setQ(e)} className="rounded-full border border-primary-foreground/40 px-3 py-1 hover:bg-primary-foreground/10">{e}</button>
            ))}
          </div>
          {(parsed.maxTime || parsed.exclude.length > 0) && (
            <p className="mt-3 text-sm">
              Understood:{" "}
              {parsed.maxTime && <span className="mr-2 rounded bg-accent px-2 py-0.5 text-accent-foreground">≤ {parsed.maxTime} min</span>}
              {parsed.exclude.map((e) => <span key={e} className="mr-2 rounded bg-accent px-2 py-0.5 text-accent-foreground">no {e}</span>)}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div>
            <label className="text-sm font-semibold">Cuisine</label>
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2">
              {cuisines.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Max time</label>
            <select value={time} onChange={(e) => setTime(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2">
              <option value={0}>Any</option>
              {[15, 30, 45, 60].map((t) => <option key={t} value={t}>{t} min</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">My pantry</label>
            <div className="mt-1 flex gap-2">
              <input value={pantryInput} onChange={(e) => setPantryInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPantry()}
                placeholder="rice, onion, tomato" className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm" />
              <button onClick={addPantry} className="rounded-lg bg-accent px-3 text-sm font-bold text-accent-foreground">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {pantry.map((p) => (
                <button key={p} onClick={() => setPantry(pantry.filter((x) => x !== p))} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {p} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
            {pantry.length > 0 && <button onClick={() => setPantry([])} className="mt-2 text-xs text-muted-foreground underline">Clear pantry</button>}
          </div>
        </aside>

        <main>
          <p className="mb-4 text-sm text-muted-foreground">{results.length} recipe{results.length === 1 ? "" : "s"}</p>
          {results.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No recipes match. Try loosening your filters.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ r, match }) => (
                <RecipeCard key={r.id} r={r} match={match} fav={favs.includes(r.id)}
                  onFav={() => setFavs(favs.includes(r.id) ? favs.filter((f) => f !== r.id) : [...favs, r.id])} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
