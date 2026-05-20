import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

interface GenerateParams {
  prompt: string;
  onChunk?: (chunk: string) => void;
}

export async function generateCopy({ prompt, onChunk }: GenerateParams): Promise<string> {
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
