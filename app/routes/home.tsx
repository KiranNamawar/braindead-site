import type { Route } from "./+types/home";
import { ThemeToggle } from "~/components/theme-toggle";
import { SearchButton } from "~/components/command-palette/SearchButton";
import { TextCaseConverter } from "~/components/tools/text-case-converter/TextCaseConverter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BrainDead" },
    { name: "description", content: "Welcome to BrainDead!" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BrainDead</h1>
          <div className="flex items-center gap-4">
            {/* Mobile search button */}
            <div className="sm:hidden">
              <SearchButton />
            </div>
            {/* Desktop keyboard shortcut hint */}
            <div className="hidden sm:block">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
              <span className="text-sm text-muted-foreground ml-2">
                to search
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Welcome to BrainDead!</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Your collection of simple, everyday web utilities.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Press{" "}
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd+K</kbd> or{" "}
              <kbd className="px-2 py-1 bg-muted rounded text-xs">/</kbd> to open
              the command palette and search for tools!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-12">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Text Tools</h3>
              <p className="text-sm text-muted-foreground">
                Format, convert, and manipulate text easily
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Developer Tools</h3>
              <p className="text-sm text-muted-foreground">
                JSON formatting, encoding, and debugging utilities
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Image Tools</h3>
              <p className="text-sm text-muted-foreground">
                Resize, convert, and optimize images
              </p>
            </div>
          </div>

          {/* Text Case Converter Demo */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-2xl font-bold mb-4">Text Case Converter</h2>
            <p className="text-muted-foreground mb-6">
              Convert text between different case formats with advanced options.
            </p>
            <TextCaseConverter />
          </div>
        </div>
      </main>
    </div>
  );
}
