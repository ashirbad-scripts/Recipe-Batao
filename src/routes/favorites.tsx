import { createFileRoute, Link } from "@tanstack/react-router";
import { loadRecipes } from "@/lib/recipes";
import { useFavorites } from "@/lib/storage";
import { RecipeCard } from "@/components/RecipeCard";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Recipe Bolo" },
      { name: "description", content: "Your saved recipes." },
      { property: "og:title", content: "Favorites — Recipe Bolo" },
      { property: "og:description", content: "Your saved recipes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const [favs, setFavs] = useFavorites();
  const list = loadRecipes().filter((r) => favs.includes(r.id));
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-4xl text-primary">Favorites</h1>
        {list.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Nothing saved yet. <Link to="/" className="text-accent underline">Discover recipes</Link></p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => <RecipeCard key={r.id} r={r} fav onFav={() => setFavs(favs.filter((f) => f !== r.id))} />)}
          </div>
        )}
      </div>
    </div>
  );
}
