import { useEffect, useMemo, useState, useRef } from "react";
import TopNav from "@/components/navigation/top-nav";

export default function Home() {
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [selectedAiProvider, setSelectedAiProvider] = useState("ChatGPT");
  const [displayedConfig, setDisplayedConfig] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const config = useMemo(() => {
    let c: any;
    if (selectedAiProvider === "ChatGPT") {
      c = {
        "openapi": "3.1.0",
        "info": {
          "title": "Integrations",
          "description": "Integrations",
          "version": "v1.0.0"
        },
        "servers": [
          {
            "url": "https://68ea-2601-19e-4501-bcd8-c160-c9ce-574f-acac.ngrok-free.app/api"
          }
        ],
        "paths": {},
        "components": {
          "schemas": {}
        }
      };
      if (selectedIntegrations.includes("Gmail")) {
        c.paths["/gmail/unread-messages"] = {
          "get": {
            "description": "Get the unread emails from Gmail",
            "operationId": "GmailGetUnreadMessages",
            "parameters": [],
            "deprecated": false
          }
        }
      }
    } else if (selectedAiProvider === "ElevenLabs (Coming soon)") {
      c = {
        "description": "Coming soon!"
      }
    }
    return JSON.stringify(c, null, 2);
  }, [selectedIntegrations, selectedAiProvider]);
  
  // Ensure textarea gets updated when config changes
  useEffect(() => {
    setDisplayedConfig(config);
    
    // Force a refresh of the textarea by focusing and blurring
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const isActive = document.activeElement === textarea;
      if (!isActive) {
        textarea.focus();
        textarea.blur();
      }
    }
  }, [config]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white">
      <TopNav
        selectedIntegrations={selectedIntegrations}
        setSelectedIntegrations={setSelectedIntegrations}
        selectedAiProvider={selectedAiProvider}
        setSelectedAiProvider={setSelectedAiProvider}
      />
      <main className="flex-1 flex items-center justify-center overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="w-full h-full flex items-center justify-center p-4">
          <textarea
            ref={textareaRef}
            className="w-3/5 h-[80vh]" 
            style={{ 
              height: 'calc(80vh - 6rem)',
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem'
            }}
            readOnly
            value={displayedConfig}
            key={`${selectedIntegrations.join('-')}-${selectedAiProvider}`}
          />
        </div>
      </main>
    </div>
  );
}
