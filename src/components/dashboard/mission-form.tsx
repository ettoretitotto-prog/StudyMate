"use client";

import { useActionState, useEffect, useRef } from "react";
import { PlusCircle } from "lucide-react";

import { createMissionAction, type MissionFormState } from "@/lib/actions/missions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: MissionFormState = {};

export function MissionForm() {
  const [state, formAction, isPending] = useActionState(createMissionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <Card className="bg-card/90">
      <CardHeader>
        <CardTitle>Nuova missione</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Materia</Label>
              <Input id="subject" name="subject" placeholder="Biologia" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Durata in minuti</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={1}
                max={180}
                placeholder="30"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titolo missione</Label>
            <Input id="title" name="title" placeholder="DNA" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea id="description" name="description" placeholder="Capitolo 3" required />
          </div>

          {state.error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
              {state.success}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Creo..." : "Crea missione"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
