export function buildReactionPrompt({
  customer,
  selectedIngredients,
  selectedMethod,
  result,
}) {
  const ingredientList = selectedIngredients
    .map((ingredient) => {
      return `${ingredient.name}: ${ingredient.traits.join(", ")}`;
    })
    .join("\n");

  return `
You are writing flavor text for Midnight Menu, a cozy cooking puzzle game.

The game has already calculated the score.
Do not change the score.
Do not invent new scoring rules.
Do not claim the dish matched traits it did not match.
Do not say the AI cooked the dish.
The player is the chef.

Customer:
${customer.name}

Customer request:
${customer.requestText ?? customer.request}

Chosen ingredients:
${ingredientList}

Cooking method:
${selectedMethod.name}

Score:
${result.score}

Matched target traits:
${result.matchedTraits.join(", ") || "none"}

Missed target traits:
${result.missedTraits.join(", ") || "none"}

Avoid traits triggered:
${result.avoidTraitsTriggered.join(", ") || "none"}

Write cozy, concise flavor text.

Return JSON only in this exact shape:
{
  "dishName": string,
  "dishDescription": string,
  "customerReaction": string,
  "shortExplanation": string
}
`.trim();
}
