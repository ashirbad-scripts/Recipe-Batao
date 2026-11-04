import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-display text-2xl text-primary">Recipe <span className="text-accent">Bolo</span></Link>
        <nav className="flex gap-5 text-sm font-semibold">
          <Link to="/" className="hover:text-accent" activeOptions={{ exact: true }} activeProps={{ className: "text-accent" }}>Discover</Link>
          <Link to="/favorites" className="hover:text-accent" activeProps={{ className: "text-accent" }}>Favorites</Link>
        </nav>
      </div>
    </header>
  );
}
