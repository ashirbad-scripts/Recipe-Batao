import { describe, it, expect } from "vitest";
import { parseQuery, pantryMatch } from "@/lib/nlp";
import { scaleIngredient, parseTimers } from "@/lib/cooking";
import { loadRecipes } from "@/lib/recipes";

describe("sous-chef rules", () => {
  it("parses time limit from query", () => {
    expect(parseQuery("spicy rice under 30 minutes").maxTime).toBe(30);
    expect(parseQuery("curry within 1 hour").maxTime).toBe(60);
  });
  it("parses excluded ingredients", () => {
    expect(parseQuery("curry without onion or garlic").exclude).toEqual(["onion", "garlic"]);
  });
  it("computes pantry match and missing", () => {
    const egg = loadRecipes().find((r) => r.id === "egg-bhurji")!;
    const m = pantryMatch(egg, ["egg", "onion", "tomato", "butter"]);
    expect(m.missing).toContain("green chillies");
    expect(m.percent).toBe(50);
  });
  it("scales quantities", () => {
    expect(scaleIngredient("1/2 teaspoon Turmeric", 2)).toBe("1 teaspoon Turmeric");
    expect(scaleIngredient("3 Tomatoes", 0.5)).toBe("1 1/2 Tomatoes");
  });
  it("parses timers", () => {
    expect(parseTimers("cook for 10 minutes then 30 seconds").map((t) => t.seconds)).toEqual([600, 30]);
  });
  it("loads the demo csv", () => {
    expect(loadRecipes().length).toBe(10);
  });
});
