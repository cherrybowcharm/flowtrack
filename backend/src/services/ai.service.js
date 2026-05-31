const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

/**
 * Calls the Anthropic Claude API to generate a structured task title
 * and description from a natural language user input.
 *
 * Falls back gracefully if the API key is missing or the call fails.
 */
async function suggestTask(userInput) {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    logger.warn("AI suggestion requested but AI_API_KEY is not configured");
    throw new AppError("AI suggestions are not configured. Please add an API key.", 503);
  }

  const prompt = `You are a task management assistant. A user described a task in natural language. 
Convert it into a clean, professional task entry.

User input: "${userInput}"

Respond ONLY with a valid JSON object in exactly this format (no markdown, no extra text):
{
  "title": "A clear, concise task title (max 10 words)",
  "description": "A one or two sentence description of exactly what needs to be done"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error("AI API error response", { status: response.status, body: errorBody });
      throw new AppError("AI service is temporarily unavailable.", 503);
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || "";

    // Parse the JSON response
    let suggestion;
    try {
      suggestion = JSON.parse(rawText.trim());
    } catch {
      logger.error("AI returned invalid JSON", { rawText });
      throw new AppError("AI returned an unexpected response format.", 503);
    }

    if (!suggestion.title || !suggestion.description) {
      throw new AppError("AI response was incomplete.", 503);
    }

    return {
      title: suggestion.title.trim(),
      description: suggestion.description.trim(),
      originalInput: userInput,
    };
  } catch (error) {
    if (error.isOperational) throw error;
    logger.error("AI suggestion failed", { error: error.message });
    throw new AppError("AI suggestion service encountered an error.", 503);
  }
}

module.exports = { suggestTask };
