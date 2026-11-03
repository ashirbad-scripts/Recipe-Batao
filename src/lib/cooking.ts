/** Serving scaling, timer parsing, substitutions. */

function toNum(s: string) {
  const parts = s.trim().split(/\s+/);
  return parts.reduce((a, p) => {
    const [n = "0", d] = p.split("/");
    return a + (d ? Number(n) / Number(d) : Number(n));
  }, 0);
}
export function formatQty(n: number) {
  const whole = Math.floor(n);
  const frac = n - whole;
  const fracs: [number, string][] = [[0, ""], [0.25, "1/4"], [1 / 3, "1/3"], [0.5, "1/2"], [2 / 3, "2/3"], [0.75, "3/4"], [1, ""]];
  const [v, label] = fracs.reduce((b, f) => (Math.abs(f[0] - frac) < Math.abs(b[0] - frac) ? f : b));
  const w = v === 1 ? whole + 1 : whole;
  if (!label) return String(w);
  return w ? `${w} ${label}` : label;
}
export function scaleIngredient(line: string, factor: number) {
  const m = line.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(?=\s)/);
  if (!m || factor === 1) return line;
  const q = m[1] ?? "";
  return formatQty(toNum(q) * factor) + line.slice(q.length);
}

/** Seconds for each duration mentioned in a step ("10 minutes", "30 seconds", "1 hour"). */
export function parseTimers(step: string): { label: string; seconds: number }[] {
  const re = /(\d+)(?:\s*(?:-|to)\s*(\d+))?\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b/gi;
  const out: { label: string; seconds: number }[] = [];
  for (const m of step.matchAll(re)) {
    const n = Number(m[2] ?? m[1]);
    const u = (m[3] ?? "").toLowerCase();
    const mult = u.startsWith("h") ? 3600 : u.startsWith("s") ? 1 : 60;
    out.push({ label: m[0], seconds: n * mult });
  }
  return out;
}

const SUBS: [RegExp, { sub: string; note: string }[]][] = [
  [/paneer/, [{ sub: "Firm tofu", note: "Vegan, press first for texture" }, { sub: "Halloumi", note: "Holds shape in curries" }]],
  [/cream/, [{ sub: "Cashew paste", note: "Blend 10 soaked cashews with water" }, { sub: "Coconut milk", note: "Adds mild sweetness" }]],
  [/butter/, [{ sub: "Ghee", note: "Nuttier, higher smoke point" }, { sub: "Olive oil", note: "Use 3/4 the amount" }]],
  [/ghee/, [{ sub: "Butter", note: "Lower smoke point, cook gentler" }, { sub: "Coconut oil", note: "Vegan option" }]],
  [/curd|yogurt|dahi/, [{ sub: "Greek yogurt", note: "Thicker, thin with milk" }, { sub: "Coconut yogurt", note: "Dairy-free" }]],
  [/\bmilk\b/, [{ sub: "Oat milk", note: "Neutral flavour, dairy-free" }, { sub: "Coconut milk", note: "Richer, for curries" }]],
  [/coconut milk/, [{ sub: "Cashew cream", note: "Similar richness" }, { sub: "Milk + cream", note: "Non-vegan, mild" }]],
  [/egg/, [{ sub: "Crumbled tofu", note: "For bhurji / scrambles, add kala namak" }]],
  [/amchur/, [{ sub: "Lemon juice", note: "1 tsp amchur ≈ 2 tsp lemon juice, add at end" }]],
  [/kasuri methi/, [{ sub: "Dried oregano pinch", note: "Different but herbal" }]],
  [/soy sauce/, [{ sub: "Tamari", note: "Gluten-free" }, { sub: "Coconut aminos", note: "Lower sodium, sweeter" }]],
  [/vinegar/, [{ sub: "Lemon juice", note: "Same acidity" }]],
  [/maida|all purpose flour/, [{ sub: "Cornflour", note: "Use half the amount to thicken" }]],
  [/parmesan/, [{ sub: "Nutritional yeast", note: "Vegan, cheesy umami" }, { sub: "Processed cheese", note: "Melts easily" }]],
  [/sugar/, [{ sub: "Jaggery", note: "Earthier sweetness" }, { sub: "Honey", note: "Use 3/4 the amount" }]],
  [/onion/, [{ sub: "Shallots", note: "Milder" }, { sub: "Asafoetida pinch", note: "For no-onion cooking" }]],
  [/garlic/, [{ sub: "Asafoetida pinch", note: "Jain / no-garlic option" }]],
  [/tomato/, [{ sub: "Tomato puree", note: "2 tbsp per tomato" }, { sub: "Tamarind", note: "For tang only" }]],
  [/green chilli/, [{ sub: "Red chilli flakes", note: "1/4 tsp per chilli" }]],
  [/red chilli powder/, [{ sub: "Paprika", note: "Milder, more colour" }]],
  [/sunflower oil|\boil\b/, [{ sub: "Any neutral oil", note: "Groundnut, rice bran, canola" }]],
  [/rice/, [{ sub: "Quinoa", note: "Higher protein" }, { sub: "Cauliflower rice", note: "Low-carb" }]],
  [/noodle|pasta|penne/, [{ sub: "Whole wheat pasta", note: "More fibre" }, { sub: "Rice noodles", note: "Gluten-free" }]],
  [/mushroom/, [{ sub: "Zucchini", note: "Similar moisture" }, { sub: "Paneer", note: "More protein" }]],
  [/basil/, [{ sub: "Coriander leaves", note: "Different but fresh" }]],
  [/tofu/, [{ sub: "Paneer", note: "Non-vegan" }, { sub: "Chickpeas", note: "Cooked" }]],
];
export function substitutesFor(ingredient: string) {
  const s = ingredient.toLowerCase();
  return SUBS.find(([re]) => re.test(s))?.[1] ?? [];
}
