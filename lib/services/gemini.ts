import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

// Lite first — less congested on free tier; 2.0-flash has limit:0 on free tier.
const TEXT_MODEL_CANDIDATES = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
] as const;
const IMAGE_MODEL = "gemini-2.5-flash-image";

export type GeneratedImage = {
  data: string;
  mimeType: string;
};

export class GeminiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiServiceError";
  }
}

function resolveApiKey(override?: string | null): string {
  const key = override?.trim() || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiServiceError(
      "Gemini API key is not configured. Add GEMINI_API_KEY to your environment.",
    );
  }
  return key;
}

function isRetryable(message: string): boolean {
  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("404") ||
    message.includes("high demand")
  );
}

function toGeminiServiceError(error: unknown): GeminiServiceError {
  if (error instanceof GeminiServiceError) return error;

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("503") || message.includes("high demand")) {
    return new GeminiServiceError(
      "Gemini is temporarily busy. Please wait a few seconds and try again.",
    );
  }
  if (message.includes("429") || message.includes("quota")) {
    const freeTierHint = message.includes("limit: 0")
      ? " This model may not be included in the free tier."
      : "";
    return new GeminiServiceError(
      `Gemini API quota exceeded.${freeTierHint} Enable billing or wait for your rate limit to reset.`,
    );
  }
  if (message.includes("401") || message.includes("API key not valid")) {
    return new GeminiServiceError(
      "Invalid Gemini API key. Create one at https://aistudio.google.com/apikey",
    );
  }

  const cleaned = message.replace(/^\[GoogleGenerativeAI Error\]: /, "").trim();
  return new GeminiServiceError(cleaned || "Gemini request failed.");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateOnce(
  apiKey: string,
  modelName: string,
  prompt: string,
  maxChars: number,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: `You are a social media writing assistant for X (Twitter). Expand the user's brief prompt into a ready-to-post tweet. Keep it under ${maxChars} characters. Use a natural, engaging tone. Return only the tweet text with no quotes, labels, or explanation.`,
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  if (!text) {
    throw new GeminiServiceError("Gemini returned an empty response.");
  }

  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

/** Expand a short prompt into tweet-ready copy via Gemini. */
export async function expandPrompt(
  prompt: string,
  options?: { apiKey?: string | null; maxChars?: number },
): Promise<string> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new GeminiServiceError("Prompt is required.");
  }

  const maxChars = options?.maxChars ?? 280;
  const apiKey = resolveApiKey(options?.apiKey);
  let lastError: unknown;

  for (const modelName of TEXT_MODEL_CANDIDATES) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await generateOnce(apiKey, modelName, trimmed, maxChars);
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        if (isRetryable(message) && attempt === 0) {
          await sleep(1500);
          continue;
        }
        if (isRetryable(message)) break;
        throw toGeminiServiceError(error);
      }
    }
  }

  throw toGeminiServiceError(lastError);
}

function toImageQuotaError(error: unknown): GeminiServiceError {
  const base = toGeminiServiceError(error);
  if (base.message.includes("quota")) {
    return new GeminiServiceError(
      `${base.message} Image generation often requires billing on your Google AI project.`,
    );
  }
  return base;
}

/** Generate an image from a text prompt via Gemini (Nano Banana). */
export async function generateImage(
  prompt: string,
  options?: { apiKey?: string | null },
): Promise<GeneratedImage> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new GeminiServiceError("Image prompt is required.");
  }

  const apiKey = resolveApiKey(options?.apiKey);
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: trimmed,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          return {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || "image/png",
          };
        }
      }

      throw new GeminiServiceError("Gemini returned no image data.");
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (isRetryable(message) && attempt === 0) {
        await sleep(1500);
        continue;
      }
      throw toImageQuotaError(error);
    }
  }

  throw toImageQuotaError(lastError);
}
