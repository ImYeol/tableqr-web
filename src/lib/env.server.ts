const requireEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const firebaseProjectId = requireEnv("FIREBASE_PROJECT_ID");
const firebaseClientEmail = requireEnv("FIREBASE_CLIENT_EMAIL");
const firebasePrivateKey = requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

export const serverEnv = {
  supabaseServiceRoleKey,
  firebase: {
    projectId: firebaseProjectId,
    clientEmail: firebaseClientEmail,
    privateKey: firebasePrivateKey,
  },
};
