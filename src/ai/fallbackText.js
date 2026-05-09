// src/ai/fallbackText.js

const METHOD_NAME_PARTS = {
  simmer: ["Slow-Warm", "Lantern", "Velvet"],
  roast: ["Golden", "Hearth", "Ember"],
  chill: ["Moonlit", "Clear", "Dewglass"],
  whisk: ["Silver", "Cloud", "Ribbon"],
};

const TRAIT_TONE_WORDS = {
  courage: "brave",
  grief: "bittersweet",
  warmth: "warm",
  clarity: "clear",
  calm: "quiet",
  freshness: "fresh",
  home: "homeward",
  comfort: "gentle",
  care: "tender",
};

export function generateFallbackDishText({
  customer,
  selectedIngredients,
  selectedMethod,
  result,
}) {
  const dishName = buildDishName(selectedIngredients, selectedMethod, result);
  const dishDescription = buildDishDescription(
    selectedIngredients,
    selectedMethod,
    result,
  );

  return {
    dishName,
    dishDescription,
    customerReaction: getFallbackReaction(result.score, customer),
    shortExplanation: buildShortExplanation(result),
  };
}

function buildDishName(selectedIngredients, selectedMethod, result) {
  const nameParts = METHOD_NAME_PARTS[selectedMethod.id] ?? [selectedMethod.name];
  const firstPart = nameParts[result.matchedTraits.length % nameParts.length];
  const anchorIngredient =
    selectedIngredients.find((ingredient) =>
      ingredient.traits.some((trait) => result.matchedTraits.includes(trait)),
    ) ?? selectedIngredients[0];
  const secondIngredient =
    selectedIngredients.find((ingredient) => ingredient.id !== anchorIngredient.id) ??
    selectedIngredients[1];

  return `${firstPart} ${anchorIngredient.name}-${secondIngredient.name}`;
}

function buildDishDescription(selectedIngredients, selectedMethod, result) {
  const ingredientNames = selectedIngredients
    .map((ingredient) => ingredient.name.toLowerCase())
    .join(", ");
  const helpfulTone = getHelpfulTone(result);

  return `A ${helpfulTone} ${selectedMethod.name.toLowerCase()}ed dish of ${ingredientNames}, plated under midnight kitchen light.`;
}

function getHelpfulTone(result) {
  const toneTrait = result.matchedTraits[0] ?? result.relatedMatches?.[0];
  return TRAIT_TONE_WORDS[toneTrait] ?? "softly strange";
}

function buildShortExplanation(result) {
  const matchedText = formatTraitList(result.matchedTraits);
  const missedText = formatTraitList(result.missedTraits);
  const helpfulText = formatTraitList(result.relatedMatches ?? []);

  if (result.matchedTraits.length > 0 && result.missedTraits.length === 0) {
    return `The dish answered the request with ${matchedText}, with ${helpfulText || "no extra fuss"} rounding the plate.`;
  }

  if (result.matchedTraits.length > 0) {
    return `The dish carried ${matchedText}, but still missed ${missedText}.`;
  }

  return `The dish had an interesting mood, but it did not reach the main craving this time.`;
}

function getFallbackReaction(score, customer) {
  if (score >= 90) {
    return `${customer.name} takes one bite and smiles like a window has opened somewhere far away.`;
  }

  if (score >= 70) {
    return `${customer.name} eats slowly, then nods. It is not perfect, but it reaches the right place.`;
  }

  if (score >= 40) {
    return `${customer.name} seems grateful, though their craving still lingers at the edge of the plate.`;
  }

  return `${customer.name} thanks you softly, but the dish does not quite answer the dream they brought in.`;
}

function formatTraitList(traits) {
  if (!traits || traits.length === 0) {
    return "";
  }

  if (traits.length === 1) {
    return traits[0];
  }

  if (traits.length === 2) {
    return `${traits[0]} and ${traits[1]}`;
  }

  return `${traits.slice(0, -1).join(", ")}, and ${traits.at(-1)}`;
}
