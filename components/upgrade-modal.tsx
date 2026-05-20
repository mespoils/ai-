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
            <p>
              当前积分:{" "}
              <span className="font-bold text-red-500">{credits ?? 0}</span>
            </p>
            <p>升级会员解锁无限生成，敬请期待！</p>
            <p className="text-xs text-gray-400">
              支付功能即将上线，届时支持按需购买积分或订阅会员
            </p>
          </DialogDescription>
        </DialogHeader>
        <Button onClick={onClose} className="w-full">
          知道了
        </Button>
      </DialogContent>
    </Dialog>
  );
}
