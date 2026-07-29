export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_PUBLISHABLE_KEY trong file môi trường.");
  }

  return { url: url.replace(/\/$/, ""), publishableKey };
}
