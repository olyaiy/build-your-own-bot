import CreateAgentForm from "./_components/create-agent-form";

export default function CreateAgentPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Create New Agent</h1>
      <CreateAgentForm />
    </div>
  );
} 