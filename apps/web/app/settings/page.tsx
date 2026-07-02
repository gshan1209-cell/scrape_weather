import { PageContainer } from "@/components/layout/PageContainer";

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="rounded-md border border-stone-200 bg-white p-5">
        <h1 className="text-xl font-semibold">設定</h1>
        <p className="mt-2 text-sm text-stone-600">在 `.env` 設定 `NEXT_PUBLIC_API_BASE_URL`，讓前端連到 FastAPI 服務。</p>
      </div>
    </PageContainer>
  );
}
