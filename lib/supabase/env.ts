export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isForcedDemoMode() {
  return process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === "true";
}
