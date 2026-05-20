"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  result: string | null;
}

export function CopyResult({ result }: Props) {
  if (!result) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(result!);
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
