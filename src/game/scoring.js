// src/game/scoring.js

const TARGET_MATCH_POINTS = 25;
const RELATED_MATCH_POINTS = 8;
const ALL_TARGETS_BONUS = 15;
const TWO_TARGETS_BONUS = 5;
const AVOID_TRAIT_PENALTY = 10;

const CLOSE_SCORE_FLOOR = 65;
const GOOD_SCORE_FLOOR = 78;

export function scoreDish(customer, selectedIngredients, selectedMethod) {
  const ingredientTraits = selectedIngredients.flatMap(
    (ingredient) => ingredient.traits,
  );

  const addedTraits = selectedMethod?.adds ?? [];
  const softenedTraits = selectedMethod?.softens ?? [];
  const amplifiedTraits = selectedMethod?.amplifies ?? [];

  let finalTraits = [...ingredientTraits, ...addedTraits];

  // Cooking methods can remove traits that clash with the preparation.
  finalTraits = finalTraits.filter(
    (trait) => !softenedTraits.includes(trait),
  );

  // Amplified traits are duplicated internally only when already present.
  // This keeps the current behavior, though scoring below uses unique traits.
  finalTraits = [
    ...finalTraits,
    ...amplifiedTraits.filter((trait) => finalTraits.includes(trait)),
  ];

  const uniqueFinalTraits = [...new Set(finalTraits)];

  const targetTraits = customer.targetTraits ?? [];
  const relatedTraits = customer.relatedTraits ?? [];
  const avoidTraits = customer.avoidTraits ?? [];

  const matchedTraits = targetTraits.filter((trait) =>
    uniqueFinalTraits.includes(trait),
  );

  const missedTraits = targetTraits.filter(
    (trait) => !uniqueFinalTraits.includes(trait),
  );

  const relatedMatches = relatedTraits.filter((trait) =>
    uniqueFinalTraits.includes(trait),
  );

  const avoidTraitsTriggered = avoidTraits.filter((trait) =>
    uniqueFinalTraits.includes(trait),
  );

  const allTargetsMatched = matchedTraits.length === targetTraits.length;
  const mostlyMatched = matchedTraits.length >= 2;

  let rawScore =
    matchedTraits.length * TARGET_MATCH_POINTS +
    relatedMatches.length * RELATED_MATCH_POINTS -
    avoidTraitsTriggered.length * AVOID_TRAIT_PENALTY;

  if (allTargetsMatched) {
    rawScore += ALL_TARGETS_BONUS;
  } else if (mostlyMatched) {
    rawScore += TWO_TARGETS_BONUS;
  }

  // If the player got most of the request and avoided the bad traits,
  // don't let the result feel overly punishing.
  if (mostlyMatched && avoidTraitsTriggered.length === 0) {
    rawScore = Math.max(rawScore, CLOSE_SCORE_FLOOR);
  }

  // If the player matched the whole request and avoided bad traits,
  // make sure it feels like a satisfying success.
  if (allTargetsMatched && avoidTraitsTriggered.length === 0) {
    rawScore = Math.max(rawScore, GOOD_SCORE_FLOOR);
  }

  const score = clamp(rawScore, 0, 100);

  return {
    score,
    matchedTraits,
    missedTraits,
    relatedMatches,
    avoidTraitsTriggered,
    finalTraits: uniqueFinalTraits,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}