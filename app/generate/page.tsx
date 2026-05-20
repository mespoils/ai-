"use client";

import { useState } from "react";
import { CopyForm } from "@/components/copy-form";
import { CopyResult } from "@/components/copy-result";
import type { GenerateInput } from "@/lib/types";

export default function GeneratePage() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate(input: GenerateInput) {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();

    if (data.success) {
      setResult(data.result);
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
    </div>
  );
}
