import { useState } from "react";
import TopNav from "@/components/navigation/top-nav";

export default function Home() {
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [selectedAiProvider, setSelectedAiProvider] = useState("ChatGPT");

  return (
    <div className="min-h-screen bg-white">
      <TopNav
        selectedIntegrations={selectedIntegrations}
        setSelectedIntegrations={setSelectedIntegrations}
        selectedAiProvider={selectedAiProvider}
        setSelectedAiProvider={setSelectedAiProvider}
      />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <h2>Selected Integrations</h2>
          {selectedIntegrations.map((integration) => (
            <div key={integration}>{integration}</div>
          ))}
          <h2>Selected AI Provider</h2>
          <p>{selectedAiProvider}</p>
        </div>
      </main>
    </div>
  );
}
