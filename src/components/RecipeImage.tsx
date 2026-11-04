import { useState } from "react";
import { cn } from "@/lib/utils";

export function RecipeImage({ src, name, className }: { src: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(!src);
  if (failed)
    return (
      <div className={cn("flex items-center justify-center bg-primary text-primary-foreground", className)}>
        <span className="font-display text-5xl">{name.charAt(0)}</span>
      </div>
    );
  return <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className={cn("object-cover", className)} />;
}
