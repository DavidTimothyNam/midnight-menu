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

function isValidCustomer(data) {
  return (
    data &&
    typeof data.characterEmoji === "string" &&
    typeof data.characterName === "string" &&
    typeof data.requestText === "string"
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isLiveAiEnabled()) {
    return res.status(503).json({
      error: "Live AI disabled",
      code: "LIVE_AI_DISABLED",
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
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
              "You write cozy JSON-only customer text for a cooking puzzle game. Return valid JSON only. Do not use markdown. Do not add commentary.",
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
      console.error(
        "Groq customer request failed:",
        groqResponse.status,
        errorText,
      );

      return res.status(502).json({
        error: "Groq request failed",
        status: groqResponse.status,
      });
    }

    const data = await groqResponse.json();
    const text = getGroqText(data);

    if (!text) {
      return res.status(502).json({
        error: "Groq returned no text",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(stripJsonFence(text));
    } catch (error) {
      console.error("Groq returned invalid customer JSON:", text, error);

      return res.status(502).json({
        error: "Invalid Groq JSON",
      });
    }

    if (!isValidCustomer(parsed)) {
      console.error("Invalid customer response shape:", parsed);

      return res.status(502).json({
        error: "Invalid customer response shape",
      });
    }

    return res.status(200).json({
      characterEmoji: parsed.characterEmoji,
      characterName: parsed.characterName,
      requestText: parsed.requestText,
    });
  } catch (error) {
    console.error("generate-customer error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
