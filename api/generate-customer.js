/* global process */

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

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
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
      console.error(
        "Gemini customer request failed:",
        geminiResponse.status,
        errorText,
      );

      return res.status(502).json({
        error: "Gemini request failed",
        status: geminiResponse.status,
      });
    }

    const geminiData = await geminiResponse.json();
    const candidate = geminiData?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (candidate?.finishReason === "MAX_TOKENS") {
      console.error(
        "Gemini customer response hit max tokens:",
        geminiData?.usageMetadata,
      );
      return res.status(502).json({ error: "Gemini response cut off" });
    }

    if (!text) {
      return res.status(502).json({
        error: "Gemini returned no text",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("Gemini returned invalid customer JSON:", text, error);

      return res.status(502).json({
        error: "Invalid Gemini JSON",
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
