/* global process */

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const { prompt } = request.body;

    if (!prompt || typeof prompt !== "string") {
      return response.status(400).json({ error: "Missing prompt" });
    }

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 700,
            responseMimeType: "application/json",
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini error:", geminiResponse.status, errorText);
      return response.status(502).json({
        error: "Gemini request failed",
        status: geminiResponse.status,
      });
    }

    const data = await geminiResponse.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (candidate?.finishReason === "MAX_TOKENS") {
      console.error("Gemini response hit max tokens:", data?.usageMetadata);
      return response.status(502).json({ error: "Gemini response cut off" });
    }

    if (!text) {
      return response.status(502).json({ error: "Empty Gemini response" });
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("Gemini returned invalid JSON:", text, error);
      return response.status(502).json({ error: "Invalid Gemini JSON" });
    }

    if (
      !parsed ||
      typeof parsed.dishName !== "string" ||
      typeof parsed.dishDescription !== "string" ||
      typeof parsed.customerReaction !== "string" ||
      typeof parsed.shortExplanation !== "string"
    ) {
      return response.status(502).json({ error: "Malformed Gemini response" });
    }

    return response.status(200).json(parsed);
  } catch (error) {
    console.error("generate-reaction error:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
}
