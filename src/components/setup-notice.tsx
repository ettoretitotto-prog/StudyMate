import { Database, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-10">
      <Card className="w-full border-primary/30 bg-card/90">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Database className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Configura Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Copia <span className="font-mono text-foreground">.env.example</span> in{" "}
            <span className="font-mono text-foreground">.env.local</span>, inserisci URL e anon key
            Supabase, poi esegui lo schema SQL in{" "}
            <span className="font-mono text-foreground">supabase/schema.sql</span>.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background/60 p-3 text-foreground">
            <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span>Una volta fatto, login, missioni, XP, streak e leaderboard saranno attivi.</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
