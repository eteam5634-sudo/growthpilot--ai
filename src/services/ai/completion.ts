import type OpenAI from "openai";
import { getOpenAIClient } from "@/services/ai/client";

const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("503") ||
    message.includes("502") ||
    message.includes("429") ||
    message.includes("overloaded")
  );
}

export async function createChatCompletion(
  params: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "model"> & {
    model?: string;
  }
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const { model = DEFAULT_MODEL, ...rest } = params;
  const retries = MAX_RETRIES;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await client.chat.completions.create({
        model,
        ...rest,
      });
    } catch (error) {
      lastError = error;
      if (attempt >= retries || !isRetryableError(error)) {
        throw error;
      }
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI request failed");
}
