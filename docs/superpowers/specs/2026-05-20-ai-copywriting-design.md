# AI 文案生成网站 - 设计文档

## 项目概述

一个 AI 文案生成网站，用户通过勾选文案类型、风格、使用场景，输入主体和补充要求，系统自动组装成 DeepSeek 提示词并调用 API 生成文案。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js (React) + Tailwind CSS | 全栈框架，文件路由，API Routes |
| 认证 | Supabase Auth | 邮箱+密码注册登录 |
| 数据库 | Supabase PostgreSQL | 免费套餐够用，有图形界面 |
| AI | DeepSeek API | 文案生成引擎 |
| 部署 | Vercel | Next.js 官方推荐，Git 推送自动部署 |

## 架构

```
用户浏览器 → Vercel (Next.js)
  ├── 前端页面 (React 组件)
  ├── API Routes (后端接口)
  ├── Supabase (PostgreSQL + Auth)
  └── DeepSeek API (文案生成)
```

### API Routes

| 路由 | 功能 |
|------|------|
| `/api/generate` | 组装 prompt → 调 DeepSeek → 扣积分 → 存历史 |
| `/api/history` | 查/删用户生成历史 |
| `/api/credits` | 查询当前积分 |

## 数据库表

### users（Supabase Auth 自动管理）
- id, email, created_at

### profiles（用户扩展信息）
- id: uuid, PK
- user_id: uuid, FK → auth.users, UNIQUE
- credits: integer, DEFAULT 5
- created_at: timestamp

### generations（生成历史）
- id: uuid, PK
- user_id: uuid, FK → auth.users
- copy_type: text（文案类型）
- style: text（风格）
- scenario: text（使用场景）
- topic: text（推广主体）
- extra_requirements: text（补充要求）
- result: text（生成的文案）
- created_at: timestamp

## 页面

### 首页 `/`
- 产品价值介绍
- "开始生成"入口按钮
- 已登录时显示剩余积分

### 文案生成页 `/generate`
- 步骤式表单：类型 → 风格 → 场景 → 主体 → 补充要求
- 生成按钮，流式展示结果
- 积分不足弹出升级提示

### 登录/注册页 `/login`
- 邮箱 + 密码表单
- 注册成功自动创建 profiles 记录，送 5 积分

### 生成历史页 `/history`
- 列表展示历史
- 点击展开查看完整文案
- 支持删除

### 全局导航栏
- Logo、生成页入口、历史、积分显示、登录/退出

## Prompt 组装逻辑

后端 `buildPrompt()` 函数将表单字段拼接为：

```
你是一位资深文案策划师。请根据以下要求撰写文案：

【文案类型】{copy_type}
【风格要求】{style}
【使用场景】{scenario}
【推广主体】{topic}
【补充要求】{extra_requirements}

请生成一篇完整的文案，要求：
1. 语言生动自然，避免AI感
2. 结构清晰，标题吸引人，结尾有力
3. 符合使用场景的特点和受众习惯

直接输出文案内容，不要输出分析或说明。
```

## 积分系统

- 新用户注册送 5 积分
- 每次生成扣 1 积分
- 积分不足时弹窗："升级会员解锁无限生成，敬请期待"
- 扣积分使用数据库事务保证不超扣
- 生成失败需回滚积分

## 环境变量

```
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # 仅服务端用
```

## Supabase RLS 策略

- profiles 表：用户只能读自己的记录
- generations 表：用户只能读/删自己的记录
- 积分扣减在 API Route 中用 service_role_key 绕过 RLS

## UI 组件

- Tailwind CSS + shadcn/ui（开箱即用的 React 组件库）
- 响应式设计，移动端适配

## 第一版范围

### 包含
- 首页、生成页、登录、历史、积分系统
- DeepSeek API 集成
- 基础样式，移动端可用

### 不包含（预留未来）
- 真实支付、邮件通知、后台管理
- 复杂 SEO、文案编辑、上传参考
- 多模型切换、分享、导出
