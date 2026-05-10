// src/ai/fallbackText.js

const METHOD_NAME_PARTS = {
  simmer: ["Lantern", "Slow-Simmered", "Hearthsoft", "Velvet"],
  roast: ["Ember", "Golden", "Firelit", "Toasted"],
  chill: ["Moonlit", "Dewglass", "Quiet", "Starlit"],
  whisk: ["Ribbon", "Cloud", "Silver", "Featherlight"],
};

const TRAIT_TONE_WORDS = {
  courage: "brave",
  heat: "pepper-warm",
  intensity: "bright-burning",

  comfort: "gentle",
  memory: "remembered",
  sweetness: "honey-soft",

  clarity: "clear",
  honesty: "plainspoken",
  sharpness: "bright-edged",

  home: "homeward",
  stability: "steady",
  fullness: "satisfying",

  calm: "quiet",
  renewal: "new-leaf",
  freshness: "fresh",

  grief: "bittersweet",
  ocean: "tide-salted",
  preservation: "kept-close",

  focus: "wakeful",
  urgency: "hurried",
  restlessness: "unsettled",

  warmth: "warm",
  care: "tender",
  richness: "buttery",

  patience: "slow",
  boldness: "golden-bold",
  lightness: "cloud-light",
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
  const nameParts = METHOD_NAME_PARTS[selectedMethod.id] ?? [
    selectedMethod.name,
  ];
  const firstPart = nameParts[result.matchedTraits.length % nameParts.length];
  const anchorIngredient =
    selectedIngredients.find((ingredient) =>
      ingredient.traits.some((trait) => result.matchedTraits.includes(trait)),
    ) ?? selectedIngredients[0];
  const secondIngredient =
    selectedIngredients.find(
      (ingredient) => ingredient.id !== anchorIngredient.id,
    ) ?? selectedIngredients[1];

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
  const avoidText = formatTraitList(result.avoidTraitsTriggered ?? []);

  if (result.matchedTraits.length > 0 && result.missedTraits.length === 0) {
    return `The dish reached the heart of the request with ${matchedText}${
      helpfulText ? `, while ${helpfulText} added helpful notes` : ""
    }.`;
  }

  if (result.matchedTraits.length > 0) {
    return `The dish offered ${matchedText}, but the craving still wanted ${missedText}.`;
  }

  if (avoidText) {
    return `The plate had its own mood, but ${avoidText} pulled it away from what the customer needed.`;
  }

  return `The dish had an interesting feeling, but it missed the center of the request this time.`;
}

function getFallbackReaction(score, customer) {
  if (score >= 90) {
    return pickOne([
      `${customer.name} closes their eyes after the first bite. For a moment, the whole room feels easier to breathe in.`,
      `${customer.name} smiles into the steam as if the dish remembered something for them.`,
      `${customer.name} takes one bite and sits a little taller, comforted in exactly the way they hoped.`,
    ]);
  }

  if (score >= 70) {
    return pickOne([
      `${customer.name} takes another careful bite and nods. It is not exact, but it understands most of what they asked for.`,
      `${customer.name} lingers over the plate, finding enough of the feeling to stay a while.`,
      `${customer.name} seems quietly pleased, though one small note is still missing.`,
    ]);
  }

  if (score >= 40) {
    return pickOne([
      `${customer.name} warms their hands around the plate. Some part of the craving is answered, though not all of it.`,
      `${customer.name} looks grateful, but their eyes keep searching the dish for something more.`,
      `${customer.name} finishes a few bites, thoughtful and kind, but not fully satisfied.`,
    ]);
  }

  return pickOne([
    `${customer.name} gives you a kind look, but the dish drifts past the feeling they came in carrying.`,
    `${customer.name} thanks you softly. The plate is charming, but it does not quite meet the dream.`,
    `${customer.name} tries another bite, then gently sets the fork down. This was not quite the answer tonight.`,
  ]);
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

function pickOne(options) {
  return options[Math.floor(Math.random() * options.length)];
}
