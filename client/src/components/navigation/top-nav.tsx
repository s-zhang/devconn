import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopNavProps {
  selectedIntegrations: string[];
  setSelectedIntegrations: React.Dispatch<React.SetStateAction<string[]>>;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
}

export default function TopNav({
    selectedIntegrations,
    setSelectedIntegrations,
    selectedModel,
    setSelectedModel,
  }: TopNavProps) {
  const [integrationsMenuOpen, setIntegrationsMenuOpen] = useState(false);

  const integrations = [
    "Gmail",
    "Slack",
    "Google Calendar",
    "Outlook",
    "Notion"
  ];

  const models = ["GPT-3.5", "GPT-4", "Custom Model"];

  const toggleIntegration = (integration: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integration)
        ? prev.filter((i: string) => i !== integration)
        : [...prev, integration]
    );
  };

  return (
    <nav className="h-16 border-b border-gray-200 bg-white">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-2">
        <DropdownMenu open={integrationsMenuOpen} onOpenChange={setIntegrationsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "border-2",
                integrationsMenuOpen && "border-blue-600"
              )}
            >
              <Wrench className="mr-2 h-4 w-4" />
              Integrations
              {selectedIntegrations.length > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {selectedIntegrations.length}
                </span>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {integrations.map((integration) => (
              <DropdownMenuItem
                key={integration}
                className="flex items-center gap-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  toggleIntegration(integration);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIntegrations.includes(integration)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onChange={() => {}}
                />
                {integration}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {selectedModel}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {models.map((model) => (
              <DropdownMenuItem
                key={model}
                onClick={() => setSelectedModel(model)}
              >
                {model}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}