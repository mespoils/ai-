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
  imageBase64?: string;
  onChunk?: (chunk: string) => void;
}

export async function generateCopy({ prompt, imageBase64, onChunk }: GenerateParams): Promise<string> {
  const client = getClient();

  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("Missing DEEPSEEK_API_KEY");
  }

  type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

  const content: ContentPart[] = [{ type: "text", text: prompt }];

  if (imageBase64) {
    content.push({
      type: "image_url",
      image_url: { url: imageBase64 },
    });
  }

  const stream = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content }],
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
