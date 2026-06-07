import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { saveGameSession, awardGameXP } from "@/lib/services/games";

export async function POST(request: Request) {
  const { studyMapId, score, timeSeconds, xpAwarded } = await request.json();
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options: any) => {
          cookieStore.set(name, "", options);
        },
      },
    }
  );

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await saveGameSession(
      supabase as any,
      user.user.id,
      studyMapId,
      score,
      timeSeconds,
      xpAwarded
    );

    if (session) {
      // Aggiorna anche gli XP dell'utente nel profilo
      await awardGameXP(supabase as any, user.user.id, xpAwarded);
      return NextResponse.json(session, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to save game session" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in game POST API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
