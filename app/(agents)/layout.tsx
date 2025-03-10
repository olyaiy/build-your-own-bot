import { MainHeader } from "@/components/layout/main-header";


export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col overflow-hidden ">
      <MainHeader />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
