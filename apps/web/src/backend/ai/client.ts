import OpenAI from "openai";
import type { AiProvider } from "./types";

export function isAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getAiProvider(): AiProvider {
  return isAiEnabled() ? "openai" : "fallback";
}

export function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export function getAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export async function chatJson<T>(
  system: string,
  user: string,
  parse: (raw: unknown) => T
): Promise<{ data: T; model: string }> {
  const client = getOpenAIClient();
  if (!client) throw new Error("AI_NOT_CONFIGURED");

  const model = getAiModel();
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("AI_EMPTY_RESPONSE");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI_INVALID_JSON");
  }

  return { data: parse(parsed), model };
}
