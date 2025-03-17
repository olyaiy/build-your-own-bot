import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Agents",
  description: "Manage your AI agents",
};

export default function MyAgentsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">My Agents</h1>
      <p>Your agents will appear here.</p>
    </div>
  );
}
