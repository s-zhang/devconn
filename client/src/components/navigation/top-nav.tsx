import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopNav() {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("GPT-3.5");

  const tools = [
    "Code Analysis",
    "Data Visualization",
    "Text Processing",
    "Image Generation",
  ];

  const models = ["GPT-3.5", "GPT-4", "Custom Model"];

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool)
        ? prev.filter((t) => t !== tool)
        : [...prev, tool]
    );
  };

  return (
    <nav className="h-16 border-b border-gray-200 bg-white">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-2">
        <DropdownMenu open={toolsMenuOpen} onOpenChange={setToolsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "border-2",
                toolsMenuOpen && "border-blue-600"
              )}
            >
              <Wrench className="mr-2 h-4 w-4" />
              Tools
              {selectedTools.length > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {selectedTools.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {tools.map((tool) => (
              <DropdownMenuItem
                key={tool}
                className="flex items-center gap-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  toggleTool(tool);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTools.includes(tool)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onChange={() => {}}
                />
                {tool}
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