import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSearch } from "~/lib/command-palette/search-context";

interface SearchButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SearchButton({
  className = "",
  variant = "ghost",
  size = "sm",
}: SearchButtonProps) {
  const { setIsOpen } = useSearch();

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
      onClick={handleClick}
      aria-label="Open search palette"
    >
      <Search className="h-4 w-4" />
      <span className="sr-only">Search</span>
    </Button>
  );
}
