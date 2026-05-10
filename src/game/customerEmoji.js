export const ALLOWED_CUSTOMER_EMOJIS = [
  "\u{1f683}",
  "\u{1f5fa}\ufe0f",
  "\u{1f9e5}",
  "\u{1f3a7}",
  "\u{1f30a}",
  "\u{1f56f}\ufe0f",
  "\u{1f6a6}",
  "\u{1f950}",
  "\u{1fa9f}",
  "\u{1f342}",
  "\u{1f33f}",
  "\u{1f570}\ufe0f",
];

const EMOJI_PRESENTATION_SELECTOR_PATTERN = /[\ufe0e\ufe0f]/g;

const CUSTOMER_EMOJI_BY_NORMALIZED_VALUE = new Map(
  ALLOWED_CUSTOMER_EMOJIS.map((emoji) => [normalizeEmojiValue(emoji), emoji]),
);

function normalizeEmojiValue(value) {
  return value.replace(EMOJI_PRESENTATION_SELECTOR_PATTERN, "");
}

function pickAllowedCustomerEmoji(seed) {
  if (Number.isInteger(seed)) {
    const index =
      ((seed % ALLOWED_CUSTOMER_EMOJIS.length) +
        ALLOWED_CUSTOMER_EMOJIS.length) %
      ALLOWED_CUSTOMER_EMOJIS.length;

    return ALLOWED_CUSTOMER_EMOJIS[index];
  }

  return ALLOWED_CUSTOMER_EMOJIS[
    Math.floor(Math.random() * ALLOWED_CUSTOMER_EMOJIS.length)
  ];
}

export function normalizeCustomerEmoji(value, fallbackSeed) {
  if (typeof value !== "string") {
    return pickAllowedCustomerEmoji(fallbackSeed);
  }

  const normalizedValue = normalizeEmojiValue(value.trim());
  const allowedEmoji = CUSTOMER_EMOJI_BY_NORMALIZED_VALUE.get(normalizedValue);

  return allowedEmoji ?? pickAllowedCustomerEmoji(fallbackSeed);
}
