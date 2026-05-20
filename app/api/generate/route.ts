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
  const { copy_type, style, scenario, topic, extra_requirements } = body;

  if (!copy_type || !style || !scenario || !topic) {
    return NextResponse.json(
      { success: false, error: "请填写完整的文案需求" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // 1. 查询积分
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (!profile || profile.credits < 1) {
    return NextResponse.json(
      { success: false, error: "积分不足", credits: profile?.credits ?? 0 },
      { status: 402 }
    );
  }

  // 2. 组装 prompt 并调用 DeepSeek
  const prompt = buildPrompt({
    copy_type,
    style,
    scenario,
    topic,
    extra_requirements,
  });

  let result: string;
  try {
    result = await generateCopy({ prompt });
  } catch (err) {
    console.error("DeepSeek API error:", err);
    return NextResponse.json(
      { success: false, error: "生成失败，请稍后重试" },
      { status: 500 }
    );
  }

  // 3. 扣积分
  const { error: deductError } = await supabase
    .from("profiles")
    .update({ credits: profile.credits - 1 })
    .eq("user_id", userId);

  if (deductError) {
    console.error("Deduct credits error:", deductError);
    return NextResponse.json(
      { success: false, error: "积分扣减失败" },
      { status: 500 }
    );
  }

  // 4. 保存历史
  const { error: historyError } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      copy_type,
      style,
      scenario,
      topic,
      extra_requirements: extra_requirements || null,
      result,
    });

  if (historyError) {
    console.error("Save history error:", historyError);
    // 历史保存失败回滚积分
    await supabase
      .from("profiles")
      .update({ credits: profile.credits })
      .eq("user_id", userId);
  }

  return NextResponse.json({
    success: true,
    result,
    credits_remaining: profile.credits - 1,
  });
}
