import { Link } from "@tanstack/react-router";
import { Heart, Clock } from "lucide-react";
import type { Recipe } from "@/lib/recipes";
import { RecipeImage } from "./RecipeImage";

export function RecipeCard({ r, fav, onFav, match }: {
  r: Recipe; fav: boolean; onFav: () => void; match?: { percent: number; missing: string[] } | undefined;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative">
        <Link to="/recipe/$id" params={{ id: r.id }}>
          <RecipeImage src={r.image} name={r.name} className="aspect-[4/3] w-full" />
        </Link>
        <button aria-label={fav ? "Remove favorite" : "Add favorite"} onClick={onFav}
          className="absolute right-3 top-3 rounded-full bg-background/90 p-2 text-accent">
          <Heart className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
        </button>
        {match && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            {match.percent}% match
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <Link to="/recipe/$id" params={{ id: r.id }} className="font-display text-lg leading-tight hover:text-primary">{r.name}</Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded bg-secondary px-2 py-0.5 text-secondary-foreground">{r.cuisine}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time} min</span>
        </div>
        {match && match.missing.length > 0 && (
          <p className="text-xs text-muted-foreground">Missing: {match.missing.slice(0, 4).join(", ")}{match.missing.length > 4 ? "…" : ""}</p>
        )}
      </div>
    </article>
  );
}
