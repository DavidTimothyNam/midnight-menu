# Midnight Menu

A cozy AI-assisted cooking puzzle game about serving emotional dishes to midnight customers.

In **Midnight Menu**, dreamlike customers arrive with unusual cravings: something brave enough to say goodbye, something cool enough to clear the fog, or something warm enough to feel like home. The player chooses ingredients and a cooking method, then the game scores the dish using deterministic trait logic.

AI is used only to add atmosphere: dish names, descriptions, customer reactions, and cozy flavor text. The game code always controls the score.

---

## Demo

[![Midnight Menu Demo](https://img.youtube.com/vi/N12dFx8NhW0/0.jpg)](https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID_HERE)

---

## Gameplay

Each customer has:

- a dreamlike food request
- target traits
- helpful related traits
- avoid traits

The player:

1. Reads the customer request.
2. Chooses exactly 3 ingredients.
3. Chooses 1 cooking method.
4. Taps **Serve**.
5. Sees the dish reveal.
6. Serves the revealed dish.
7. Gets a deterministic score and customer reaction.

The challenge is to understand how ingredients and methods map to emotional and sensory traits.

---

## Core Design Principle

**AI does not judge the player.**

Midnight Menu uses deterministic scoring so the puzzle feels fair, learnable, and strategic.

AI can write:

- dish names
- dish descriptions
- customer reactions
- short explanations
- atmospheric request text

AI cannot:

- decide the score
- change selected ingredients
- change the cooking method
- invent scoring rules
- decide whether the player succeeded
- override matched, missed, or avoided traits

The player is the chef. The AI is only the customer/kitchen voice.

---

## Current Features

- Mobile-first React interface
- Cozy card-based UI
- 8 symbolic ingredients
- 4 cooking methods
- 3 customer prototype night
- Deterministic scoring system
- Cooking transition screen
- Dish reveal screen before final score
- Result screen with matched, missed, and avoided traits
- Final night summary with average score
- Fallback dish text so the game remains playable without AI

---

## Tech Stack

- **Frontend:** Vite + React
- **Language:** JavaScript
- **Styling:** CSS
- **AI route:** Serverless API route
- **AI providers:** Groq text generation
- **Storage:** local state
- **Deployment target:** Vercel

---

## Project Structure

```txt
midnight-menu/
  README.md
  package.json
  .env.example

  api/
    generate-reaction.js
    generate-customer.js

  src/
    App.jsx
    main.jsx

    data/
      ingredients.js
      methods.js
      customers.js

    game/
      scoring.js

    ai/
      aiClient.js
      prompts.js
      fallbackText.js

    components/
      CustomerCard.jsx
      IngredientCard.jsx
      MethodPicker.jsx
      DishReveal.jsx
      ResultCard.jsx
      FinalSummary.jsx

    styles/
      index.css
      base.css
      layout.css
      ingredients.css
      methods.css
      buttons.css
      results.css
      customers.css
      summary.css
      dishReveal.css
```
