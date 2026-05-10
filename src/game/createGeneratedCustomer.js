// src/game/createGeneratedCustomer.js

import { customers } from "../data/customers";
import { normalizeCustomerEmoji } from "./customerEmoji";

export function createGeneratedCustomerFromText({ index = 0, traits, text }) {
  return {
    id: `generated-${index}`,
    name: text.characterName,
    emoji: normalizeCustomerEmoji(text.characterEmoji, index),
    requestText: text.requestText,
    targetTraits: traits.targetTraits,
    relatedTraits: traits.relatedTraits,
    avoidTraits: traits.avoidTraits,
  };
}

export function getFallbackCustomerFromList(index = 0) {
  const fallbackCustomer = customers[index % customers.length];

  return {
    ...fallbackCustomer,
    id: fallbackCustomer.id ?? `fallback-${index}`,
  };
}
