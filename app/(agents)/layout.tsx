
export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col overflow-hidden ">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
