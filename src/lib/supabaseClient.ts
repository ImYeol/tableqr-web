import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "./env";

let browserClient: SupabaseClient | null = null;

export const createSupabaseClient = () =>
  createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

export const getBrowserSupabaseClient = () => {
  if (!browserClient) {
    browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return browserClient;
};
