/* global process */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

function isLiveAiEnabled() {
  return process.env.USE_LIVE_AI === "true";
}

function getGroqText(data) {
  return data?.choices?.[0]?.message?.content;
}

function stripJsonFence(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function isValidReaction(data) {
  return (
    data &&
    typeof data.dishName === "string" &&
    typeof data.dishDescription === "string" &&
    typeof data.customerReaction === "string" &&
    typeof data.shortExplanation === "string"
  );
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!isLiveAiEnabled()) {
    return response.status(503).json({
      error: "Live AI disabled",
      code: "LIVE_AI_DISABLED",
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: "Missing GROQ_API_KEY" });
  }

  try {
    const { prompt } = request.body || {};

    if (!prompt || typeof prompt !== "string") {
      return response.status(400).json({ error: "Missing prompt" });
    }

    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You write cozy JSON-only flavor text for a cooking puzzle game. Return valid JSON only. Do not use markdown. Do not add commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_completion_tokens: 700,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq reaction error:", groqResponse.status, errorText);

      return response.status(502).json({
        error: "Groq request failed",
        status: groqResponse.status,
      });
    }

    const data = await groqResponse.json();
    const text = getGroqText(data);

    if (!text) {
      return response.status(502).json({ error: "Empty Groq response" });
    }

    let parsed;

    try {
      parsed = JSON.parse(stripJsonFence(text));
    } catch (error) {
      console.error("Groq returned invalid JSON:", text, error);
      return response.status(502).json({ error: "Invalid Groq JSON" });
    }

    if (!isValidReaction(parsed)) {
      console.error("Malformed Groq reaction response:", parsed);
      return response.status(502).json({
        error: "Malformed Groq response",
      });
    }

    return response.status(200).json({
      dishName: parsed.dishName,
      dishDescription: parsed.dishDescription,
      customerReaction: parsed.customerReaction,
      shortExplanation: parsed.shortExplanation,
    });
  } catch (error) {
    console.error("generate-reaction error:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
}
