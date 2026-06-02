type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export function hasSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      anonKey &&
      !url.includes("your-project.supabase.co") &&
      !anonKey.includes("your-supabase-anon-key")
  );
}

export function getSupabaseConfig(): SupabaseConfig {
  if (!hasSupabaseConfig()) {
    throw new Error("Missing Supabase configuration. Copy .env.example to .env.local and fill the values.");
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  };
}
