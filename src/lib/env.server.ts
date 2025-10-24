const requireEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

export const serverEnv = {
  supabaseServiceRoleKey,
};
