// src/game/generateCustomerTraits.js

const CUSTOMER_TRAIT_SETS = [
  {
    id: "brave-goodbye",
    targetTraits: ["courage", "grief", "warmth"],
    relatedTraits: ["care", "comfort", "patience", "memory"],
    avoidTraits: ["restlessness", "urgency"],
  },
  {
    id: "clear-calm",
    targetTraits: ["clarity", "calm", "freshness"],
    relatedTraits: ["renewal", "lightness", "honesty", "patience"],
    avoidTraits: ["intensity", "heat"],
  },
  {
    id: "home-comfort",
    targetTraits: ["home", "comfort", "care"],
    relatedTraits: ["warmth", "stability", "fullness", "sweetness"],
    avoidTraits: ["urgency", "restlessness"],
  },
  {
    id: "steady-focus",
    targetTraits: ["focus", "stability", "patience"],
    relatedTraits: ["clarity", "honesty", "calm", "care"],
    avoidTraits: ["urgency", "restlessness"],
  },
  {
    id: "ocean-memory",
    targetTraits: ["ocean", "memory", "preservation"],
    relatedTraits: ["grief", "calm", "clarity", "freshness"],
    avoidTraits: ["heat", "intensity"],
  },
  {
    id: "sweet-renewal",
    targetTraits: ["sweetness", "renewal", "lightness"],
    relatedTraits: ["comfort", "freshness", "calm", "warmth"],
    avoidTraits: ["grief", "fullness"],
  },
  {
    id: "honest-comfort",
    targetTraits: ["honesty", "comfort", "care"],
    relatedTraits: ["clarity", "warmth", "patience", "sweetness"],
    avoidTraits: ["sharpness", "intensity"],
  },
  {
    id: "bold-warmth",
    targetTraits: ["boldness", "warmth", "richness"],
    relatedTraits: ["courage", "heat", "care", "fullness"],
    avoidTraits: ["restlessness"],
  },
];

const VALID_TRAITS = [
  "courage",
  "heat",
  "intensity",

  "comfort",
  "memory",
  "sweetness",

  "clarity",
  "honesty",
  "sharpness",

  "home",
  "stability",
  "fullness",

  "calm",
  "renewal",
  "freshness",

  "grief",
  "ocean",
  "preservation",

  "focus",
  "urgency",
  "restlessness",

  "warmth",
  "care",
  "richness",

  "patience",
  "boldness",
  "lightness",
];

function isValidTrait(trait) {
  return VALID_TRAITS.includes(trait);
}

function pickOne(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueValidTraits(traits) {
  return [...new Set(traits)].filter(isValidTrait);
}

export function generateCustomerTraits() {
  const traitSet = pickOne(CUSTOMER_TRAIT_SETS);

  return {
    targetTraits: uniqueValidTraits(traitSet.targetTraits).slice(0, 3),
    relatedTraits: shuffle(uniqueValidTraits(traitSet.relatedTraits)).slice(
      0,
      3,
    ),
    avoidTraits: shuffle(uniqueValidTraits(traitSet.avoidTraits)).slice(0, 2),
  };
}
