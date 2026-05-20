"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Generation } from "@/lib/types";

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
