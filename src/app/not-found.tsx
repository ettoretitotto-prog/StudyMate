import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
      <h1 className="text-3xl font-bold">Missione non trovata</h1>
      <p className="mt-3 text-muted-foreground">Questa rotta non e' disponibile nell'MVP.</p>
      <Link className={buttonVariants({ className: "mt-6" })} href="/dashboard">
        Dashboard
      </Link>
    </main>
  );
}
