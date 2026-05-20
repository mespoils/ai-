"use client";

import { useRef, useState } from "react";
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
import { COPY_TYPES, STYLES, SCENARIOS, type GenerateInput } from "@/lib/types";

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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("图片不能超过 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      copy_type: copyType,
      style,
      scenario,
      topic,
      extra_requirements: extra,
      reference_image: imageBase64 ?? undefined,
    });
  }

  const canSubmit = copyType && style && scenario && topic && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 文案类型 */}
      <div className="space-y-2">
        <Label>1 文案类型</Label>
        <Select value={copyType} onValueChange={(v) => setCopyType(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="选择文案类型" />
          </SelectTrigger>
          <SelectContent>
            {COPY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 风格 */}
      <div className="space-y-2">
        <Label>2 风格</Label>
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
        <Label>3 使用场景</Label>
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

      {/* 用户需求 */}
      <div className="space-y-2">
        <Label htmlFor="topic">4 你的需求</Label>
        <Textarea
          id="topic"
          placeholder={'描述你想发什么内容，表达什么。例如：\n"我们奶茶店新出了杨枝甘露，想在小红书发一篇笔记吸引年轻人来打卡"\n"公司团建去了大理，想发个朋友圈记录一下"'}
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      {/* 参考图片（选填） */}
      <div className="space-y-2">
        <Label>5 参考图片（选填）</Label>
        <p className="text-xs text-gray-400">
          上传参考图，AI 会分析图片风格并融入文案
        </p>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="预览"
              className="h-24 rounded-md border object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
            >
              x
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        )}
      </div>

      {/* 补充要求 */}
      <div className="space-y-2">
        <Label htmlFor="extra">6 补充要求（选填）</Label>
        <Textarea
          id="extra"
          placeholder="如：字数限制、关键词、特殊要求..."
          rows={3}
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {loading ? "生成中..." : "生成文案"}
      </Button>
    </form>
  );
}
