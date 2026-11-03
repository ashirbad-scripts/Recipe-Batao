import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Clock, ChefHat, Minus, Plus, ArrowLeft, ArrowRight, X, Timer, Repeat } from "lucide-react";
import { getRecipe, type Recipe } from "@/lib/recipes";
import { pantryMatch } from "@/lib/nlp";
import { parseTimers, scaleIngredient, substitutesFor } from "@/lib/cooking";
import { useFavorites, usePantry } from "@/lib/storage";
import { RecipeImage } from "@/components/RecipeImage";
import { SiteHeader } from "@/components/SiteHeader";

const BASE_SERVINGS = 4; // dataset has no servings column; quantities assumed for 4

export const Route = createFileRoute("/recipe/$id")({
  loader: ({ params }) => {
    const r = getRecipe(params.id);
    if (!r) throw notFound();
    return { id: r.id, name: r.name, cuisine: r.cuisine, time: r.time };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Recipe Bolo` : "Recipe unavailable — Recipe Bolo";
    const desc = loaderData ? `${loaderData.cuisine} recipe ready in ${loaderData.time} minutes, with cooking mode and substitutions.` : "Recipe not found.";
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { property: "og:title", content: title }, { property: "og:description", content: desc },
        { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="p-10 text-center">Recipe not found. <Link to="/" className="text-accent underline">Back</Link></div>
  ),
  component: RecipePage,
});

function RecipePage() {
  const { id } = Route.useLoaderData();
  const r = getRecipe(id)!;
  const [servings, setServings] = useState(BASE_SERVINGS);
  const [favs, setFavs] = useFavorites();
  const [pantry] = usePantry();
  const [openSub, setOpenSub] = useState<number | null>(null);
  const [cooking, setCooking] = useState(false);
  const fav = favs.includes(r.id);
  const match = pantry.length ? pantryMatch(r, pantry) : null;
  const factor = servings / BASE_SERVINGS;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <RecipeImage src={r.image} name={r.name} className="aspect-[4/3] w-full rounded-xl" />
          <div className="space-y-4">
            <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{r.cuisine}</span>
            <h1 className="font-display text-4xl leading-tight text-primary">{r.name}</h1>
            <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" />{r.time} minutes · {r.steps.length} steps</p>
            {match && (
              <div className="rounded-lg border border-border p-3 text-sm">
                <b className="text-accent">{match.percent}% pantry match</b>
                {match.missing.length > 0 && <p className="mt-1 text-muted-foreground">You'll need: {match.missing.join(", ")}</p>}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setCooking(true)} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">
                <ChefHat className="h-5 w-5" /> Start cooking
              </button>
              <button onClick={() => setFavs(fav ? favs.filter((f) => f !== r.id) : [...favs, r.id])}
                className="flex items-center gap-2 rounded-lg border border-accent px-5 py-3 font-semibold text-accent">
                <Heart className="h-5 w-5" fill={fav ? "currentColor" : "none"} /> {fav ? "Saved" : "Save"}
              </button>
            </div>
            {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="block text-xs text-muted-foreground underline">Original source</a>}
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.3fr]">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Ingredients</h2>
              <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                <button aria-label="Fewer servings" onClick={() => setServings(Math.max(1, servings - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-20 text-center text-sm">{servings} servings</span>
                <button aria-label="More servings" onClick={() => setServings(servings + 1)}><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {r.ingredients.map((ing, i) => {
                const subs = substitutesFor(ing);
                return (
                  <li key={i} className="py-2">
                    <div className="flex items-start justify-between gap-2">
                      <span>{scaleIngredient(ing, factor)}</span>
                      {subs.length > 0 && (
                        <button onClick={() => setOpenSub(openSub === i ? null : i)} className="flex shrink-0 items-center gap-1 text-xs text-accent">
                          <Repeat className="h-3 w-3" /> Swap
                        </button>
                      )}
                    </div>
                    {openSub === i && (
                      <ul className="mt-2 space-y-1 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                        {subs.map((s) => <li key={s.sub}><b>{s.sub}</b> — {s.note}</li>)}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl">Method</h2>
            <ol className="mt-4 space-y-4">
              {r.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{i + 1}</span>
                  <p>{s}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
      {cooking && <CookMode r={r} onClose={() => setCooking(false)} />}
    </div>
  );
}

function CookMode({ r, onClose }: { r: Recipe; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const timers = parseTimers(r.steps[step] ?? "");
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-primary text-primary-foreground">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-sm opacity-80">{r.name} · Step {step + 1} of {r.steps.length}</span>
        <button onClick={onClose} aria-label="Exit cooking mode"><X className="h-6 w-6" /></button>
      </div>
      <div className="h-1 bg-primary-foreground/20"><div className="h-1 bg-accent transition-all" style={{ width: `${((step + 1) / r.steps.length) * 100}%` }} /></div>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6">
        <p className="font-display text-3xl leading-snug md:text-4xl">{r.steps[step]}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {timers.map((t, i) => <StepTimer key={`${step}-${i}`} label={t.label} seconds={t.seconds} />)}
        </div>
      </div>
      <div className="flex justify-between px-6 py-6">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="flex items-center gap-2 rounded-lg border border-primary-foreground/40 px-5 py-3 disabled:opacity-30">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        {step < r.steps.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-accent-foreground">Next <ArrowRight className="h-5 w-5" /></button>
        ) : (
          <button onClick={onClose} className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-foreground">Done 🎉</button>
        )}
      </div>
    </div>
  );
}

function StepTimer({ label, seconds }: { label: string; seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || left <= 0) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [running, left]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <button onClick={() => (left <= 0 ? (setLeft(seconds), setRunning(false)) : setRunning(!running))}
      className={`flex items-center gap-3 rounded-xl px-5 py-3 ${left <= 0 ? "bg-accent text-accent-foreground" : "bg-primary-foreground/10"}`}>
      <Timer className="h-5 w-5" />
      <span className="font-mono text-2xl">{mm}:{ss}</span>
      <span className="text-xs opacity-80">{left <= 0 ? "Done — reset" : running ? "Pause" : `Start ${label}`}</span>
    </button>
  );
}
