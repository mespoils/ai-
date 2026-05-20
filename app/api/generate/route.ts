import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { buildPrompt } from "@/lib/prompt";
import { generateCopy } from "@/lib/deepseek";
import { getUserId } from "@/lib/auth";

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id") || (await getUserId());
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { copy_type, style, scenario, topic, extra_requirements, reference_image } = body;

  if (!copy_type || !style || !scenario || !topic) {
    return NextResponse.json(
      { success: false, error: "请填写完整的文案需求" },
      { status: 400 }
    );
  }

  // 限制 base64 图片大小（约 5MB 以内）
  if (reference_image && reference_image.length > 7_000_000) {
    return NextResponse.json(
      { success: false, error: "图片太大，请压缩到 5MB 以内" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // 组装 prompt 并调用 DeepSeek
  const prompt = buildPrompt({
    copy_type,
    style,
    scenario,
    topic,
    extra_requirements,
  });

  let result: string;
  try {
    result = await generateCopy({ prompt, imageBase64: reference_image });
  } catch (err) {
    console.error("DeepSeek API error:", err);
    return NextResponse.json(
      { success: false, error: "生成失败，请稍后重试" },
      { status: 500 }
    );
  }

  // 保存历史
  await supabase.from("generations").insert({
    user_id: userId,
    copy_type,
    style,
    scenario,
    topic,
    extra_requirements: extra_requirements || null,
    result,
  });

  return NextResponse.json({ success: true, result });
}
