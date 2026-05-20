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
        <h2 className="text-2xl font-semibold text-center mb-8">
          支持多种文案类型
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {COPY_TYPES.map((t) => (
            <Card
              key={t.value}
              className="text-center hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 text-sm font-medium">
                {t.label}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 使用流程 */}
      <section>
        <h2 className="text-2xl font-semibold text-center mb-8">
          三步生成文案
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "选择需求",
              desc: "勾选文案类型、风格、使用场景",
            },
            {
              step: "2",
              title: "输入主体",
              desc: "填写推广的产品或服务信息",
            },
            {
              step: "3",
              title: "一键生成",
              desc: "AI 自动撰写完整文案",
            },
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
