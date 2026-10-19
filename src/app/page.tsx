import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Bangla Bazar Admin</h1>
      <p className="text-muted-foreground">Dashboard coming soon.</p>
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </main>
  );
}
