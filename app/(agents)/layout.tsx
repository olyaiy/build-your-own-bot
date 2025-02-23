import { MainHeader } from '@/components/main-header';

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen">
      <MainHeader />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
