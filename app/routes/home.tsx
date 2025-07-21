import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BrainDead" },
    { name: "description", content: "Collection of everyday web tools" },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold">Welcome to BrainDead</h1>
      <p className="mt-4 text-lg">Collection of everyday web tools</p>
    </div>
  );
}
