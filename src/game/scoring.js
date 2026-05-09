// src/game/scoring.js

const MATCH_POINTS = 30;
const ALL_TARGETS_BONUS = 10;
const AVOID_TRAIT_PENALTY = 15;

export function scoreDish(customer, selectedIngredients, selectedMethod) {
  const ingredientTraits = selectedIngredients.flatMap(
    (ingredient) => ingredient.traits,
  );

  const addedTraits = selectedMethod?.adds ?? [];
  const softenedTraits = selectedMethod?.softens ?? [];
  const amplifiedTraits = selectedMethod?.amplifies ?? [];

  let finalTraits = [...ingredientTraits, ...addedTraits];

  finalTraits = finalTraits.filter(
    (trait) => !softenedTraits.includes(trait),
  );

  finalTraits = [
    ...finalTraits,
    ...amplifiedTraits.filter((trait) => finalTraits.includes(trait)),
  ];

  const uniqueFinalTraits = [...new Set(finalTraits)];

  const matchedTraits = customer.targetTraits.filter((trait) =>
    uniqueFinalTraits.includes(trait),
  );

  const missedTraits = customer.targetTraits.filter(
    (trait) => !uniqueFinalTraits.includes(trait),
  );

  const avoidTraitsTriggered = customer.avoidTraits.filter((trait) =>
    uniqueFinalTraits.includes(trait),
  );

  const allTargetsMatched =
    matchedTraits.length === customer.targetTraits.length;

  const rawScore =
    matchedTraits.length * MATCH_POINTS +
    (allTargetsMatched ? ALL_TARGETS_BONUS : 0) -
    avoidTraitsTriggered.length * AVOID_TRAIT_PENALTY;

  const score = clamp(rawScore, 0, 100);

  return {
    score,
    matchedTraits,
    missedTraits,
    avoidTraitsTriggered,
    finalTraits: uniqueFinalTraits,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}