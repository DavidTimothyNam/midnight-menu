import { buildReactionPrompt } from "./prompts";

export async function generateReaction({
  customer,
  selectedIngredients,
  selectedMethod,
  result,
}) {
  const prompt = buildReactionPrompt({
    customer,
    selectedIngredients,
    selectedMethod,
    result,
  });

  // console.log("Calling /api/generate-reaction...");

  const response = await fetch("/api/generate-reaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  // console.log("/api/generate-reaction status:", response.status);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("/api/generate-reaction failed:", data);
    throw new Error(data?.error || "AI request failed");
  }

  if (
    !data ||
    typeof data.dishName !== "string" ||
    typeof data.dishDescription !== "string" ||
    typeof data.customerReaction !== "string" ||
    typeof data.shortExplanation !== "string"
  ) {
    console.error("Malformed AI response:", data);
    throw new Error("Malformed AI response");
  }

  // console.log("AI dish text received:", data);
  return data;
}
