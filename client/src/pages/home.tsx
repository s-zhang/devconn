import { useState } from "react";
import TopNav from "@/components/navigation/top-nav";

export default function Home() {
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("GPT-3.5");

  return (
    <div className="min-h-screen bg-white">
      <TopNav
        selectedIntegrations={selectedIntegrations}
        setSelectedIntegrations={setSelectedIntegrations}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <h2>Selected Integrations</h2>
          {selectedIntegrations.map((integration) => (
            <div key={integration}>{integration}</div>
          ))}
          <h2>Selected Model</h2>
          <p>{selectedModel}</p>
        </div>
      </main>
    </div>
  );
}
