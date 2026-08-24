// firebase-admin v12+ dropped the old namespaced admin.credential/admin.auth()
// API from its default export in favor of modular subpath imports.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let initialized = false;

const ensureInitialized = () => {
  if (initialized) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not configured. Download a service account key from " +
      "Firebase Console > Project Settings > Service Accounts, and set the full JSON as this env var."
    );
  }

  const serviceAccount = JSON.parse(raw);
  // Most host env-var UIs collapse real newlines, so private_key often arrives
  // with literal "\n" sequences that need to be turned back into line breaks.
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  initialized = true;
};

// Verifies a Firebase ID token server-side and returns the decoded claims.
// This is the only trustworthy source of the signed-in Google account's
// email/name — never trust an email the client sends in a request body.
export const verifyFirebaseIdToken = async (idToken) => {
  ensureInitialized();
  return getAuth().verifyIdToken(idToken);
};
