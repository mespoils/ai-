import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    });
  }
  return _client;
}

interface GenerateParams {
  prompt: string;
  onChunk?: (chunk: string) => void;
}

export async function generateCopy({ prompt, onChunk }: GenerateParams): Promise<string> {
  const client = getClient();

  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("Missing DEEPSEEK_API_KEY");
  }

  const stream = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  let full = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      full += delta;
      onChunk?.(delta);
    }
  }

  return full;
}
