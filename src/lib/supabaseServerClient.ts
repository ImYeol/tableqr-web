import { createClient } from "@supabase/supabase-js";

import { env } from "./env";
import { serverEnv } from "./env.server";

export const createSupabaseServiceClient = () =>
  createClient(env.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
