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
  return `Cozy cooking game customer.
T:${targetTraits.join(",")}
H:${relatedTraits.join(",")}
A:${avoidTraits.join(",")}
Use a single real emoji, not :emoji_code:. The name can be a brief description like "The ...".
JSON only: {"characterEmoji":"","characterName":"","requestText":"1 sentence. Hint T/H. Warn against A. No trait names."}`;
}
