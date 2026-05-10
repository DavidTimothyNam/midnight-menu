export function buildReactionPrompt({
  customer,
  selectedIngredients,
  selectedMethod,
  result,
}) {
  return `
You write flavor text for Midnight Menu, a cozy cooking puzzle game.

Rules:
- The player is the chef.
- Score is already calculated. Do not change it.
- Do not invent rules.
- Do not claim traits matched unless listed in matchedTraits.
- Return JSON only.

JSON shape:
{
  "dishName": string,
  "dishDescription": string,
  "customerReaction": string,
  "shortExplanation": string
}

Input:
${JSON.stringify({
  request: customer.requestText,
  ingredients: selectedIngredients.map((item) => ({
    name: item.name,
    traits: item.traits,
  })),
  method: {
    name: selectedMethod.name,
    adds: selectedMethod.adds,
    softens: selectedMethod.softens,
    amplifies: selectedMethod.amplifies,
  },
  score: result.score,
  matchedTraits: result.matchedTraits,
  missedTraits: result.missedTraits,
  avoidTraitsTriggered: result.avoidTraitsTriggered,
})}
`;
}

export function buildCustomerPrompt({
  targetTraits,
  relatedTraits,
  avoidTraits,
}) {
  return `
Write one cozy Midnight Menu customer for a cooking puzzle game.

The player will see only the customer, name, emoji, and request.
The trait lists are hidden design guidance.

Do not mention trait names directly.
Do not explain the scoring.
Do not include ingredients.
Do not include cooking methods.
Do not decide whether the player succeeds.

Target traits to hint at:
${targetTraits.join(", ")}

Helpful related traits to gently suggest:
${relatedTraits.join(", ")}

Traits to warn against:
${avoidTraits.join(", ")}

Write a request that includes:
- one emotional desire
- one or two sensory clues
- a gentle warning related to the avoid traits

Return JSON only:
{
  "characterEmoji": string,
  "characterName": string,
  "requestText": string
}
`;
}
