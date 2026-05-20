# AI 文案生成网站 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建一个 AI 文案生成网站，支持表单勾选生成、邮箱登录、积分系统、生成历史。

**Architecture:** Next.js 15 App Router 全栈应用，Supabase 提供 PostgreSQL + Auth，DeepSeek API 生成文案。前端 shadcn/ui 组件 + Tailwind CSS，后端 API Routes 处理业务逻辑。

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Supabase (Auth + PostgreSQL), DeepSeek API, Vercel 部署

---

## 文件结构

```
aiapp/
├── .env.local.example        # 环境变量模板
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── components.json            # shadcn/ui 配置
├── app/
│   ├── globals.css
│   ├── layout.tsx             # 根布局 + Supabase Provider + Navbar
│   ├── page.tsx               # 首页
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts       # Supabase Auth 回调
│   ├── login/
│   │   └── page.tsx           # 登录/注册页
│   ├── generate/
│   │   └── page.tsx           # 文案生成页
│   ├── history/
│   │   └── page.tsx           # 生成历史页
│   └── api/
│       ├── generate/
│       │   └── route.ts       # POST - 生成文案
│       ├── history/
│       │   └── route.ts       # GET/DELETE - 历史记录
│       └── credits/
│           └── route.ts       # GET - 查询积分
├── lib/
│   ├── types.ts               # 共享类型
│   ├── supabase/
│   │   ├── client.ts          # 浏览器端 Supabase 客户端
│   │   └── server.ts          # 服务端 Supabase 客户端 (service_role)
│   ├── prompt.ts              # buildPrompt() 函数
│   └── deepseek.ts            # DeepSeek API 封装
├── components/
│   ├── navbar.tsx             # 全局导航栏
│   ├── upgrade-modal.tsx      # 积分不足弹窗
│   ├── copy-form.tsx          # 文案生成表单
│   ├── copy-result.tsx        # 生成结果展示
│   └── history-list.tsx       # 历史列表
├── middleware.ts              # Next.js 鉴权中间件
└── supabase/
    └── migrations/
        └── 001_schema.sql     # 数据库建表 + RLS
```

---

## Phase 1: 项目初始化

### Task 1: 创建 Next.js 项目并初始化 Git

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, etc. (via create-next-app)

- [ ] **Step 1: 用 create-next-app 脚手架创建项目**

```bash
cd C:\Users\Asus\Desktop\aiapp
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack
```

Expected: 项目文件生成成功，package.json 包含 next, react, tailwindcss 等依赖

- [ ] **Step 2: 安装额外依赖**

```bash
npm install @supabase/supabase-js @supabase/ssr openai
npm install -D @types/node
```

- [ ] **Step 3: 初始化 shadcn/ui**

```bash
npx shadcn@latest init -d
```

Expected: 创建 `components.json`，更新 `app/globals.css`。

- [ ] **Step 4: 安装 shadcn/ui 组件**

```bash
npx shadcn@latest add button card input textarea dialog select label separator avatar dropdown-menu --yes
```

Expected: 组件文件创建在 `components/ui/` 目录

- [ ] **Step 5: 初始化 Git**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, shadcn/ui, Supabase deps"
```

---

### Task 2: 环境变量配置

**Files:**
- Create: `.env.local.example`, `.env.local`
- Modify: `.gitignore`

- [ ] **Step 1: 创建环境变量模板**

```bash
cat > .env.local.example << 'EOF'
# DeepSeek API
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Supabase (来自 Supabase 项目 Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

- [ ] **Step 2: 复制为 .env.local（稍后填入真实值）**

```bash
cp .env.local.example .env.local
```

- [ ] **Step 3: 确认 .gitignore 包含 .env.local**

Read `.gitignore`，确认有 `.env*.local` 条目。没有则添加。

- [ ] **Step 4: 更新 next.config.ts 读取环境变量**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 5: 提交**

```bash
git add .env.local.example .gitignore next.config.ts
git commit -m "chore: add env variable template"
```

---

## Phase 2: 基础设施

### Task 3: 类型定义

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: 创建类型文件**

```typescript
// 文案生成表单输入
export interface GenerateInput {
  copy_type: string;
  style: string;
  scenario: string;
  topic: string;
  extra_requirements?: string;
}

// 生成历史记录
export interface Generation {
  id: string;
  user_id: string;
  copy_type: string;
  style: string;
  scenario: string;
  topic: string;
  extra_requirements: string | null;
  result: string;
  created_at: string;
}

// 用户积分信息
export interface UserCredits {
  credits: number;
}

// API 响应
export interface GenerateResponse {
  success: boolean;
  result?: string;
  error?: string;
  credits_remaining?: number;
}

// 文案类型选项
export const COPY_TYPES = [
  { value: "产品文案", label: "产品文案" },
  { value: "广告语", label: "广告语" },
  { value: "公众号推文", label: "公众号推文" },
  { value: "短视频脚本", label: "短视频脚本" },
  { value: "小红书笔记", label: "小红书笔记" },
  { value: "朋友圈文案", label: "朋友圈文案" },
  { value: "品牌故事", label: "品牌故事" },
  { value: "活动策划", label: "活动策划" },
];

// 风格选项
export const STYLES = [
  { value: "专业正式", label: "专业正式" },
  { value: "幽默风趣", label: "幽默风趣" },
  { value: "温暖感人", label: "温暖感人" },
  { value: "简约清新", label: "简约清新" },
  { value: "激情澎湃", label: "激情澎湃" },
  { value: "文艺优雅", label: "文艺优雅" },
];

// 使用场景选项
export const SCENARIOS = [
  { value: "电商详情页", label: "电商详情页" },
  { value: "朋友圈", label: "朋友圈" },
  { value: "小红书", label: "小红书" },
  { value: "抖音", label: "抖音" },
  { value: "公众号", label: "公众号" },
  { value: "官网首页", label: "官网首页" },
  { value: "线下海报", label: "线下海报" },
];
```

- [ ] **Step 2: 提交**

```bash
git add lib/types.ts
git commit -m "feat: add shared types and form options"
```

---

### Task 4: Supabase 客户端

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: 创建浏览器端客户端**

`lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: 创建服务端客户端（用于 API Routes）**

`lib/supabase/server.ts`:

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts
git commit -m "feat: add Supabase browser and server clients"
```

---

### Task 5: 数据库 Schema 和 RLS

**Files:**
- Create: `supabase/migrations/001_schema.sql`

> **注意:** 此步骤需要在 Supabase 控制台中手动执行 SQL，或通过 Supabase CLI。对于零基础，直接在 Supabase 网页 SQL Editor 中执行。

- [ ] **Step 1: 编写建表 SQL**

`supabase/migrations/001_schema.sql`:

```sql
-- 用户扩展信息表（注册时自动创建）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 生成历史表
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  copy_type TEXT NOT NULL,
  style TEXT NOT NULL,
  scenario TEXT NOT NULL,
  topic TEXT NOT NULL,
  extra_requirements TEXT,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引：按用户查历史
CREATE INDEX idx_generations_user_id ON public.generations(user_id, created_at DESC);

-- RLS 开启
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- profiles: 用户只能读自己的
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- generations: 用户只能读自己的
CREATE POLICY "Users can read own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

-- generations: 用户只能删自己的
CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- 新用户注册时自动创建 profiles 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, credits)
  VALUES (new.id, 5);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 2: 在 Supabase SQL Editor 执行**

打开 Supabase 项目 → SQL Editor → 粘贴上述 SQL → Run。

Expected: 两张表创建成功，RLS 策略生效，触发器就位。

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/001_schema.sql
git commit -m "feat: add database schema with RLS and auto-profile trigger"
```

---

### Task 6: Prompt 组装 & DeepSeek API 封装

**Files:**
- Create: `lib/prompt.ts`, `lib/deepseek.ts`

- [ ] **Step 1: 创建 Prompt 组装函数**

`lib/prompt.ts`:

```typescript
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

  prompt += `

请生成一篇完整的文案，要求：
1. 语言生动自然，避免AI感
2. 结构清晰，有吸引人的标题和有力的结尾
3. 符合使用场景的特点和受众习惯

直接输出文案内容，不要输出分析或说明。`;

  return prompt;
}
```

- [ ] **Step 2: 创建 DeepSeek API 封装**

`lib/deepseek.ts`:

```typescript
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
```

- [ ] **Step 3: 提交**

```bash
git add lib/prompt.ts lib/deepseek.ts
git commit -m "feat: add prompt builder and DeepSeek API wrapper with streaming"
```

---

## Phase 3: 认证系统

### Task 7: Next.js 鉴权中间件

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: 创建中间件**

`middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/generate", "/history", "/api/generate", "/api/history"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 将 user_id 注入请求头，方便 API Routes 使用
  response.headers.set("x-user-id", user.id);
  return response;
}

export const config = {
  matcher: ["/generate", "/history", "/api/generate", "/api/history"],
};
```

- [ ] **Step 2: 提交**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware for protected routes"
```

---

### Task 8: Auth 回调路由

**Files:**
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: 创建 Auth 回调**

`app/auth/callback/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // Supabase 会在客户端通过 exchangeCodeForSession 处理
    // 这里只需重定向
    return NextResponse.redirect(`${origin}/auth/callback?next=${encodeURIComponent(next)}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

- [ ] **Step 2: 提交**

```bash
git add app/auth/callback/route.ts
git commit -m "feat: add auth callback route"
```

---

### Task 9: 登录/注册页

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: 创建登录页**

`app/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setError("注册成功！请检查邮箱确认（或直接登录）");
        setIsRegister(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/generate");
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isRegister ? "注册" : "登录"}</CardTitle>
          <CardDescription>
            {isRegister ? "创建账号，免费获得 5 积分" : "登录后开始生成文案"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少6位密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-green-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "处理中..." : isRegister ? "注册" : "登录"}
            </Button>
          </form>
          <p className="text-sm text-center mt-4 text-gray-500">
            {isRegister ? "已有账号？" : "没有账号？"}
            <button
              type="button"
              className="ml-1 text-blue-600 hover:underline"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "去登录" : "去注册"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/login/page.tsx
git commit -m "feat: add login/register page with Supabase Auth"
```

---

## Phase 4: 布局和首页

### Task 10: 全局导航栏组件

**Files:**
- Create: `components/navbar.tsx`

- [ ] **Step 1: 创建导航栏**

`components/navbar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        fetch("/api/credits")
          .then((r) => r.json())
          .then((d) => setCredits(d.credits))
          .catch(() => {});
      }
    });
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(null);
    router.push("/");
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg text-blue-600">
            AI文案
          </Link>
          <Link href="/generate" className="text-sm text-gray-600 hover:text-gray-900">
            生成文案
          </Link>
          {user && (
            <Link href="/history" className="text-sm text-gray-600 hover:text-gray-900">
              历史记录
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {credits !== null && (
                <span className="text-sm text-gray-500">
                  积分: <span className="font-semibold text-blue-600">{credits}</span>
                </span>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                退出
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">登录</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/navbar.tsx
git commit -m "feat: add global navbar with auth state and credits display"
```

---

### Task 11: 根布局

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: 更新根布局**

`app/layout.tsx`（覆盖脚手架生成的文件）:

```typescript
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI文案 - 智能文案生成",
  description: "AI驱动的智能文案生成工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 确认 globals.css 包含 Tailwind**

`app/globals.css` 应包含 Tailwind 和 shadcn/ui 的 CSS 变量（由 shadcn init 自动生成）。检查内容正确。

- [ ] **Step 3: 提交**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: add root layout with Navbar"
```

---

### Task 12: 首页

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 编写首页**

`app/page.tsx`（覆盖脚手架默认内容）:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COPY_TYPES } from "@/lib/types";

export default function HomePage() {
  return (
    <div className="py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          AI 帮你写出<span className="text-blue-600">爆款文案</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          只需选择类型、风格和场景，输入推广主体，AI 自动为你生成专业文案
        </p>
        <Link href="/generate">
          <Button size="lg" className="text-lg px-8">
            开始生成
          </Button>
        </Link>
      </section>

      {/* 支持的文案类型 */}
      <section>
        <h2 className="text-2xl font-semibold text-center mb-8">支持多种文案类型</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {COPY_TYPES.map((t) => (
            <Card key={t.value} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-sm font-medium">{t.label}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 使用流程 */}
      <section>
        <h2 className="text-2xl font-semibold text-center mb-8">三步生成文案</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "1", title: "选择需求", desc: "勾选文案类型、风格、使用场景" },
            { step: "2", title: "输入主体", desc: "填写推广的产品或服务信息" },
            { step: "3", title: "一键生成", desc: "AI 自动撰写完整文案" },
          ].map((s) => (
            <div key={s.step} className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                {s.step}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/page.tsx
git commit -m "feat: add landing page with hero, types, and workflow"
```

---

## Phase 5: API Routes

### Task 13: 积分查询 API

**Files:**
- Create: `app/api/credits/route.ts`

- [ ] **Step 1: 创建积分查询接口**

`app/api/credits/route.ts`:

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add app/api/credits/route.ts
git commit -m "feat: add credits query API"
```

---

### Task 14: 文案生成 API（核心）

**Files:**
- Create: `app/api/generate/route.ts`

- [ ] **Step 1: 创建生成接口**

`app/api/generate/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { buildPrompt } from "@/lib/prompt";
import { generateCopy } from "@/lib/deepseek";

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
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
  const prompt = buildPrompt({ copy_type, style, scenario, topic, extra_requirements });

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
    // 历史保存失败不影响结果返回，但需回滚积分
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
```

- [ ] **Step 2: 提交**

```bash
git add app/api/generate/route.ts
git commit -m "feat: add copy generation API with credits deduction and history"
```

---

### Task 15: 历史记录 API

**Files:**
- Create: `app/api/history/route.ts`

- [ ] **Step 1: 创建历史接口**

`app/api/history/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("generations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: 提交**

```bash
git add app/api/history/route.ts
git commit -m "feat: add history list and delete API"
```

---

## Phase 6: 功能页面

### Task 16: 文案生成页（表单 + 结果）

**Files:**
- Create: `components/copy-form.tsx`, `components/copy-result.tsx`
- Create: `app/generate/page.tsx`

- [ ] **Step 1: 创建表单组件**

`components/copy-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COPY_TYPES, STYLES, SCENARIOS, GenerateInput } from "@/lib/types";

interface Props {
  onSubmit: (data: GenerateInput) => Promise<void>;
  loading: boolean;
}

export function CopyForm({ onSubmit, loading }: Props) {
  const [copyType, setCopyType] = useState("");
  const [style, setStyle] = useState("");
  const [scenario, setScenario] = useState("");
  const [topic, setTopic] = useState("");
  const [extra, setExtra] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ copy_type: copyType, style, scenario, topic, extra_requirements: extra });
  }

  const canSubmit = copyType && style && scenario && topic && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 文案类型 */}
      <div className="space-y-2">
        <Label>① 文案类型</Label>
        <Select value={copyType} onValueChange={setCopyType}>
          <SelectTrigger>
            <SelectValue placeholder="选择文案类型" />
          </SelectTrigger>
          <SelectContent>
            {COPY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 风格 */}
      <div className="space-y-2">
        <Label>② 风格</Label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Button
              key={s.value}
              type="button"
              variant={style === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStyle(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 使用场景 */}
      <div className="space-y-2">
        <Label>③ 使用场景</Label>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <Button
              key={s.value}
              type="button"
              variant={scenario === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setScenario(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 主体 */}
      <div className="space-y-2">
        <Label htmlFor="topic">④ 推广主体</Label>
        <Input
          id="topic"
          placeholder="请输入你要推广的产品/服务/主题"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      {/* 补充要求 */}
      <div className="space-y-2">
        <Label htmlFor="extra">⑤ 补充要求（选填）</Label>
        <Textarea
          id="extra"
          placeholder="如：字数限制、关键词、特殊要求..."
          rows={3}
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {loading ? "生成中..." : "生成文案（消耗 1 积分）"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: 创建结果展示组件**

`components/copy-result.tsx`:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  result: string | null;
}

export function CopyResult({ result }: Props) {
  if (!result) return null;

  function handleCopy() {
    navigator.clipboard.writeText(result!);
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">生成结果</h3>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            复制文案
          </Button>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-md">
          {result}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: 创建生成页面**

`app/generate/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { CopyForm } from "@/components/copy-form";
import { CopyResult } from "@/components/copy-result";
import { UpgradeModal } from "@/components/upgrade-modal";
import { GenerateInput } from "@/lib/types";

export default function GeneratePage() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  async function handleGenerate(input: GenerateInput) {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();

    if (res.status === 402) {
      setCredits(data.credits ?? 0);
      setShowUpgrade(true);
    } else if (data.success) {
      setResult(data.result);
      setCredits(data.credits_remaining);
    } else {
      alert(data.error || "生成失败");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">生成文案</h1>
      <CopyForm onSubmit={handleGenerate} loading={loading} />
      {loading && (
        <p className="text-center text-gray-500 mt-6">AI 正在创作中...</p>
      )}
      <CopyResult result={result} />
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        credits={credits}
      />
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add components/copy-form.tsx components/copy-result.tsx app/generate/page.tsx
git commit -m "feat: add copy generation page with form and result"
```

---

### Task 17: 升级提示弹窗

**Files:**
- Create: `components/upgrade-modal.tsx`

- [ ] **Step 1: 创建弹窗组件**

`components/upgrade-modal.tsx`:

```typescript
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  credits: number | null;
}

export function UpgradeModal({ open, onClose, credits }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>积分不足</DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>当前积分: <span className="font-bold text-red-500">{credits ?? 0}</span></p>
            <p>升级会员解锁无限生成，敬请期待！</p>
            <p className="text-xs text-gray-400">支付功能即将上线，届时支持按需购买积分或订阅会员</p>
          </DialogDescription>
        </DialogHeader>
        <Button onClick={onClose} className="w-full">
          知道了
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/upgrade-modal.tsx
git commit -m "feat: add upgrade prompt modal for insufficient credits"
```

---

### Task 18: 生成历史页

**Files:**
- Create: `components/history-list.tsx`
- Create: `app/history/page.tsx`

- [ ] **Step 1: 创建历史列表组件**

`components/history-list.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Generation } from "@/lib/types";

export function HistoryList() {
  const [items, setItems] = useState<Generation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setItems(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    setItems(items.filter((i) => i.id !== id));
  }

  if (loading) {
    return <p className="text-center text-gray-400 py-8">加载中...</p>;
  }

  if (items.length === 0) {
    return <p className="text-center text-gray-400 py-8">暂无生成记录</p>;
  }

  const typeLabels: Record<string, string> = {
    copy_type: "类型",
    style: "风格",
    scenario: "场景",
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {item.copy_type}
                </span>
                <span className="font-medium text-sm">{item.topic}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleString("zh-CN")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  删除
                </Button>
              </div>
            </div>
            {expanded === item.id && (
              <div className="mt-3 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded-md">
                {item.result}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 创建历史页面**

`app/history/page.tsx`:

```typescript
import { HistoryList } from "@/components/history-list";

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">生成历史</h1>
      <HistoryList />
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add components/history-list.tsx app/history/page.tsx
git commit -m "feat: add generation history page with expand and delete"
```

---

## Phase 7: 收尾

### Task 19: 最终检查和部署准备

- [ ] **Step 1: 本地运行测试**

```bash
npm run dev
```

验证：
- 首页 `/` 正常显示
- 注册/登录 `/login` 流程正常（需要先填入 Supabase 环境变量）
- 生成页面 `/generate` 表单完整
- 生成文案流程正常（需要 DeepSeek API Key）
- 积分扣减和历史记录正常
- 积分不足弹窗正常

- [ ] **Step 2: 构建检查**

```bash
npm run build
```

期望：构建成功，无 TypeScript 错误。

- [ ] **Step 3: 创建 .env.local.example 最终版（如果 Task 2 未完善）**

- [ ] **Step 4: 提交最终版本**

```bash
git add -A
git commit -m "feat: complete v1 AI copywriting website"
```

---

## 前置准备（手动步骤）

在开始编码前，需要手动完成以下步骤：

### Supabase 项目创建

1. 打开 [supabase.com](https://supabase.com)，注册/登录
2. 创建新项目，填写项目名 `ai-copywriting`
3. 记下数据库密码
4. 进入 Settings → API，复制：
   - `Project URL` → 填入 `.env.local` 的 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → 填入 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → 填入 `SUPABASE_SERVICE_ROLE_KEY`
5. 进入 Authentication → Settings：
   - 确认 `Enable email confirmations` 开启（或关闭以简化注册流程）
   - 将 `http://localhost:3000/auth/callback` 加入 Redirect URLs

### DeepSeek API Key

1. 打开 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册并获取 API Key
3. 填入 `.env.local` 的 `DEEPSEEK_API_KEY`

---

## 依赖清单

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.6",
    "openai": "^4"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
}
```
