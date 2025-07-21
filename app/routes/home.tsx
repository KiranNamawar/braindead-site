import type { Route } from "./+types/home";
import { ThemeToggle } from "~/components/theme-toggle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BrainDead" },
    { name: "description", content: "Collection of everyday web tools" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BrainDead</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to BrainDead</h2>
          <p className="text-lg text-muted-foreground">
            Collection of everyday web tools
          </p>
        </div>
      </main>
    </div>
  );
}
