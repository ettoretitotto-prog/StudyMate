"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Lock, LogIn, Mail, User, UserPlus } from "lucide-react";

import { loginAction, signUpAction, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  mode: "login" | "register";
};

const initialState: AuthFormState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? loginAction : signUpAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isLogin = mode === "login";

  return (
    <Card className="w-full border-border/80 bg-card/95">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
          {isLogin ? <LogIn className="h-5 w-5" aria-hidden="true" /> : <UserPlus className="h-5 w-5" aria-hidden="true" />}
        </div>
        <CardTitle>{isLogin ? "Login" : "Registrazione"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" name="name" autoComplete="name" className="pl-9" required />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" autoComplete="email" className="pl-9" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="pl-9"
                minLength={6}
                required
              />
            </div>
          </div>

          {state.error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm text-foreground">
              {state.success}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isLogin ? <LogIn className="h-4 w-4" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
            {isPending ? "Attendi..." : isLogin ? "Entra" : "Crea account"}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              Non hai un account?{" "}
              <Link className="font-semibold text-primary hover:text-primary/80" href="/register">
                Registrati
              </Link>
            </>
          ) : (
            <>
              Hai gia' un account?{" "}
              <Link className="font-semibold text-primary hover:text-primary/80" href="/login">
                Accedi
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
