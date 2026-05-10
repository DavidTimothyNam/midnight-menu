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
  relatedTraits = [],
  avoidTraits = [],
}) {
  return `
You write customers for Midnight Menu, a cozy cooking puzzle game.

Rules:
- The game has already selected the hidden scoring traits.
- Do not invent new gameplay traits.
- Do not directly list the exact trait words.
- Write a cozy, slightly dreamlike food request.
- Hint at target traits through sensory/emotional language.
- Include one gentle warning that hints at avoid traits.
- Return JSON only.

Return:
{
  "characterEmoji": string,
  "characterName": string,
  "requestText": string
}

Input:
${JSON.stringify({
  targetTraits,
  relatedTraits,
  avoidTraits,
})}
`;
}
