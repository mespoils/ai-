import { HistoryList } from "@/components/history-list";

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">生成历史</h1>
      <HistoryList />
    </div>
  );
}
