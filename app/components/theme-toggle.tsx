import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../lib/theme-context";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getNextTheme = () => {
    switch (theme) {
      case "light":
        return "dark";
      case "dark":
        return "system";
      case "system":
      default:
        return "light";
    }
  };

  const getNextIcon = () => {
    const nextTheme = getNextTheme();
    switch (nextTheme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getTooltipText = () => {
    const nextTheme = getNextTheme();
    switch (nextTheme) {
      case "light":
        return "Switch to light mode";
      case "dark":
        return "Switch to dark mode";
      case "system":
        return "Switch to system mode";
      default:
        return "Switch theme";
    }
  };

  const handleToggle = () => {
    setTheme(getNextTheme());
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-9 w-9 p-0"
          >
            {getNextIcon()}
            <span className="sr-only">{getTooltipText()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
