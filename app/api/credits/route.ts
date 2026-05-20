import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ credits: 0 }, { status: 200 });
  }

  return NextResponse.json({ credits: data.credits });
}
