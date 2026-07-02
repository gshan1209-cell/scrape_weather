import { PageContainer } from "@/components/layout/PageContainer";

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="rounded-md border border-stone-200 bg-white p-5">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-stone-600">Configure `NEXT_PUBLIC_API_BASE_URL` in `.env` to point this web app at the API.</p>
      </div>
    </PageContainer>
  );
}
