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
