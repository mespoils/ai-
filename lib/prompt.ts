import { GenerateInput } from "./types";

export function buildPrompt(input: GenerateInput): string {
  let prompt = `你是一位资深文案策划师。请根据以下要求撰写文案：

【文案类型】${input.copy_type}
【风格要求】${input.style}
【使用场景】${input.scenario}
【推广主体】${input.topic}`;

  if (input.extra_requirements) {
    prompt += `\n【补充要求】${input.extra_requirements}`;
  }

  if (input.copy_type === "朋友圈文案") {
    prompt += `

请生成一段简短的文案（不超过200字），要求：
1. 语言生动自然，像朋友发的动态，避免AI感
2. 不要标题，不要开头结尾结构，就是一段自然的分享
3. 符合朋友圈的特点和受众习惯

直接输出这段话，不要输出分析或说明。`;
  } else {
    prompt += `

请生成一篇完整的文案，要求：
1. 语言生动自然，避免AI感
2. 结构清晰，有吸引人的标题和有力的结尾
3. 符合使用场景的特点和受众习惯

直接输出文案内容，不要输出分析或说明。`;
  }

  return prompt;
}
