# 🍳 Recipe Bolo

> **Tell us what you have. We'll tell you what to cook.**

**Recipe Bolo** is an NLP-powered recipe discovery and cooking assistant designed to solve a common everyday problem:

> **“I want to cook, but what can I make with what I have?”**

Instead of relying on traditional keyword-based recipe searches, Recipe Bolo understands natural-language requests such as:

> *“I want something spicy under 30 minutes without onions.”*

It combines **natural-language processing, TF-IDF similarity, pantry matching, ingredient substitutions, serving scaling, and interactive cooking timers** to help users discover and prepare suitable recipes.

---

## ✨ Features

### 🔎 Natural-Language Recipe Search

Users can search using normal human language instead of rigid filters.

Examples:

```text
spicy chicken under 30 minutes
quick vegetarian dinner without onions
creamy pasta in 20 mins
healthy recipes without dairy
```

Recipe Bolo extracts useful intent such as:

- ⏱️ Maximum cooking time
- 🚫 Excluded ingredients
- 🌶️ Culinary concepts
- 🍽️ Relevant recipe terms

---

### 🧠 NLP-Powered Recipe Ranking

Recipe Bolo uses **TF-IDF vectorization and cosine similarity** to rank recipes according to the user's query.

Different recipe fields are assigned different weights:

| Recipe Field | Weight |
|---|---:|
| Recipe Name | 3× |
| Cuisine | 2× |
| Ingredients | 1.5× |
| Instructions | 0.3× |

This gives greater importance to the recipe name and ingredients while still considering the cooking instructions.

---

### 🥫 Pantry Matching

Users can select ingredients they currently have in their pantry.

Recipe Bolo then determines:

- Ingredients already available
- Missing ingredients
- Pantry match percentage

Common staples such as:

```text
salt
water
oil
```

are excluded from missing-ingredient calculations.

Example:

```text
Pantry:
✓ Chicken
✓ Tomato
✓ Garlic
✓ Rice

Recipe requires:
✓ Chicken
✓ Tomato
✓ Garlic
✗ Onion
✗ Cream

Pantry Match: 60%
```

---

### 🔄 Ingredient Substitutions

Don't have a required ingredient?

Recipe Bolo provides alternative ingredients that can be used as substitutes, including ratio-adjusted suggestions where applicable.

---

### 🍽️ Dynamic Serving Scaling

Users can change the number of servings and ingredient quantities are automatically adjusted.

Example:

```text
2 servings → 4 servings

100g Rice → 200g Rice
1 Onion   → 2 Onions
```

---

### 👨‍🍳 Step-by-Step Cooking Mode

Recipe instructions are converted into sequential cooking steps.

The cooking interface provides:

- Step-by-step instructions
- Automatic timer detection
- Interactive countdown timers
- Hands-free cooking workflow

For example:

```text
Simmer the sauce for 10 minutes.

        ↓

     ⏱️ 10:00
```

---

# 🏗️ Architecture

```text
                         recipes.csv
                             │
                             ▼
                       CSV Parser
                          csv.ts
                             │
                             ▼
                    Recipe Objects Store
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   Natural Query          Pantry Items      Instructions
          │                  │                  │
          ▼                  ▼                  ▼
    Query Parser        Pantry Matcher      Step Parser
          │                  │                  │
          ▼                  │                  ▼
  Concept Expansion          │             Timer Detection
          │                  │                  │
          ▼                  │                  │
 TF-IDF + Cosine             │                  │
    Similarity               │                  │
          │                  │                  │
          └──────────────┬───┘                  │
                         ▼                      │
                  Recipe Ranking                │
                         │                      │
                         ▼                      ▼
                  ┌─────────────────────────────────┐
                  │          Recipe Details         │
                  │                                 │
                  │ Ingredients • Match • Steps     │
                  │ Substitutions • Timers          │
                  └─────────────────────────────────┘
```

---

# 🧠 NLP & ML Pipeline

The main NLP and cooking logic is implemented in:

```text
src/lib/nlp.ts
src/lib/cooking.ts
```

## 1. Query Parsing

`parseQuery()` converts a natural-language request into structured information.

For example:

```text
spicy curry under 30 minutes without onions
```

can be interpreted as:

```text
Concept: spicy
Time Limit: 30 minutes
Excluded Ingredient: onion
Main Term: curry
```

The parser can recognize expressions such as:

```text
under 30 mins
in 1 hour
within 45 minutes
quick
without onion
no dairy
```

Basic text normalization includes:

- Stop-word removal
- Token normalization
- Stemming

---

## 2. Concept Expansion

Recipe Bolo maps culinary concepts to related ingredients.

For example:

```text
spicy
```

can expand to:

```text
chilli
masala
pepper
```

Similarly:

```text
creamy
```

can be associated with:

```text
milk
cream
butter
```

This allows the search system to understand broader culinary intent instead of depending entirely on exact keyword matches.

---

## 3. TF-IDF + Cosine Similarity

Each recipe is represented as a TF-IDF vector.

The user's query is converted into the same vector space.

Cosine similarity is then used to calculate how closely the query matches each recipe.

```text
                    User Query
                        │
                        ▼
                   TF-IDF Vector
                        │
                        ▼
                Cosine Similarity
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Recipe A      Recipe B      Recipe C
         0.82          0.61          0.37
          │
          ▼
      Higher Rank
```

This provides a lightweight, fast recipe-ranking system that runs entirely on the client.

---

# 🥫 Pantry Matching

The pantry engine compares the user's available ingredients against the cleaned ingredient list of each recipe.

Example:

```text
Pantry:
chicken
tomato
garlic
rice
```

Recipe:

```text
chicken
tomato
garlic
onion
cream
```

Result:

```text
Matched: 3 / 5

Match: 60%

Missing:
- onion
- cream
```

Staple ingredients such as salt, water, and oil are ignored when calculating missing ingredients.

---

# ⏱️ Cooking Intelligence

Recipe Bolo also processes recipe instructions to create a more interactive cooking experience.

## Step Extraction

Long instruction paragraphs are split into sequential cooking steps.

```text
Raw Instructions
       ↓
Sentence Segmentation
       ↓
Individual Cooking Steps
       ↓
Cooking Mode
```

## Timer Extraction

Cooking durations are automatically detected from instructions.

Examples:

```text
Cook for 10 minutes
Simmer for 20 mins
Bake for 1 hour
```

These durations are converted into interactive countdown timers.

---

# 🛠️ Tech Stack

## Frontend

- React 19
- TypeScript
- TanStack Start
- TanStack Router

## Styling

- Tailwind CSS
- shadcn/ui

### Design System

Recipe Bolo uses a simple three-color design system:

```text
Cream Background
Deep Forest Green #1f3d2b
Warm Saffron      #d97706
```

---

## 🧠 NLP / ML

- TF-IDF
- Cosine Similarity
- Regex-based entity extraction
- Token normalization
- Stop-word removal
- Stemming
- Culinary concept expansion

---

## 💾 Client-Side Storage

Recipe Bolo uses browser `localStorage` instead of requiring user accounts.

Stored information includes:

- Pantry items
- Ingredient substitutions
- Favorite recipes

This keeps the application lightweight and usable without authentication.

---

## 🧪 Testing

Testing is handled using **Vitest**.

The test suite validates important application logic including:

```text
✓ Natural-language query parsing
✓ Time constraint extraction
✓ Ingredient exclusion detection
✓ Pantry matching
✓ Timer extraction
```

Test file:

```text
src/test/souschef.test.ts
```

---

# 📁 Project Structure

```text
src/
│
├── data/
│   └── recipes.csv
│
├── lib/
│   ├── csv.ts
│   ├── nlp.ts
│   └── cooking.ts
│
├── test/
│   └── souschef.test.ts
│
├── components/
│   └── ...
│
├── routes/
│   └── ...
│
└── ...
```

---

# 📊 Dataset

Recipe Bolo uses a CSV-based recipe dataset.

The application includes a drop-in data pipeline designed to support a larger recipe collection.

```text
recipes.csv
     │
     ▼
CSV Parser
     │
     ▼
Recipe Objects
     │
     ▼
NLP Processing
     │
     ▼
Recipe Ranking
```

The architecture is ready to accept a **5,000+ recipe dataset**.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd recipe-bolo
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start the Development Server

```bash
npm run dev
```

Then open the local development URL shown by the development server.

---

# 🧪 Run Tests

```bash
npm test
```

---

# 🔮 Future Improvements

Potential improvements include:

- 🤗 Transformer/BERT-based recipe embeddings
- 🔍 Vector database for large recipe collections
- 🧠 LLM-powered ingredient substitutions
- 🥗 Personalized dietary profiles
- 📈 Recommendation learning from user interactions
- 🗣️ Voice-controlled cooking mode
- 📱 Progressive Web App support
- ☁️ Backend API and cloud deployment
- 🖼️ Recipe image understanding
- 🤖 LLM-powered conversational cooking assistant

---

# 🎯 Project Highlights

Recipe Bolo combines modern frontend development with practical NLP and recommendation techniques:

```text
React + TypeScript
        │
        ├── Natural Language Processing
        │
        ├── TF-IDF
        │
        ├── Cosine Similarity
        │
        ├── Recommendation Logic
        │
        ├── Pantry Matching
        │
        ├── LocalStorage
        │
        └── Interactive Cooking Assistant
```

The goal is to make recipe discovery feel more natural:

> **Tell Recipe Bolo what you have, what you want, and what you can't eat — and it helps you decide what to cook.**

---

# 📌 Project Status

**Status: 🟢 Core Application Complete**

### Completed

- [x] Natural-language recipe search
- [x] Query intent extraction
- [x] Time constraint detection
- [x] Ingredient exclusion detection
- [x] Culinary concept expansion
- [x] TF-IDF recipe ranking
- [x] Cosine similarity
- [x] Pantry matching
- [x] Missing ingredient detection
- [x] Ingredient substitutions
- [x] Dynamic serving scaling
- [x] Step-by-step cooking mode
- [x] Automatic cooking timers
- [x] Favorite recipes
- [x] LocalStorage persistence
- [x] Automated tests
- [x] CSV data pipeline

---

## 🍽️ Recipe Bolo

**Tell us what you have.  
Tell us what you want.  
We'll tell you what to cook.**
