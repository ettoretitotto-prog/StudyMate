import type { ReactNode } from "react";
import { BookOpenCheck, Sparkles, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[1fr_420px]">
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
            <BookOpenCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">StudyMate</p>
            <h1 className="text-4xl font-bold tracking-normal text-foreground sm:text-5xl">Entra nella tua quest</h1>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-primary/30 bg-card/80">
            <CardContent className="flex items-center gap-3 p-4">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">XP</span>
            </CardContent>
          </Card>
          <Card className="border-secondary/30 bg-card/80">
            <CardContent className="flex items-center gap-3 p-4">
              <Trophy className="h-5 w-5 text-secondary" aria-hidden="true" />
              <span className="text-sm font-semibold">Livelli</span>
            </CardContent>
          </Card>
          <Card className="border-accent/30 bg-card/80">
            <CardContent className="flex items-center gap-3 p-4">
              <BookOpenCheck className="h-5 w-5 text-accent" aria-hidden="true" />
              <span className="text-sm font-semibold">Missioni</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {children}
    </main>
  );
}
