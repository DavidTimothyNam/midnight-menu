/* global process */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

function isLiveAiEnabled() {
  return process.env.USE_LIVE_AI === "true";
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

  const { prompt } = request.body ?? {};

  if (!prompt || typeof prompt !== "string") {
    return response.status(400).json({ error: "Missing prompt" });
  }

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You write cozy JSON-only flavor text for a cooking puzzle game. Return valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 100,
        response_format: {
          type: "json_object",
        },
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();

      return response.status(500).json({
        error: "Groq customer request failed",
        details: errorText,
      });
    }

    const data = await groqResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return response.status(500).json({
        error: "Groq returned no customer content",
      });
    }

    const parsed = JSON.parse(content);

    if (
      typeof parsed.characterEmoji !== "string" ||
      typeof parsed.characterName !== "string" ||
      typeof parsed.requestText !== "string"
    ) {
      return response.status(500).json({
        error: "Groq returned malformed customer JSON",
      });
    }

    return response.status(200).json({
      characterEmoji: parsed.characterEmoji,
      characterName: parsed.characterName,
      requestText: parsed.requestText,
    });
  } catch (error) {
    console.error("generate-customer error:", error);

    return response.status(500).json({
      error: "Internal server error",
    });
  }
}
