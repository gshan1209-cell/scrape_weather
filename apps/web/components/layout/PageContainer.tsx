export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-24 pt-5 md:pb-8">{children}</main>;
}
