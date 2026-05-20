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
