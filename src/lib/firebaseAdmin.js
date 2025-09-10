// src/lib/firebaseAdmin.js
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(key) {
  if (!key) return undefined;
  let normalized = key;
  // Remove surrounding quotes if present
  if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1);
  }
  // Restore newlines
  normalized = normalized.replace(/\\n/g, "\n");
  return normalized;
}

function loadServiceAccount() {
  // Prefer full JSON if provided
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (json) {
    try {
      const parsed = JSON.parse(json);
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: normalizePrivateKey(parsed.private_key),
      };
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e);
    }
  }
  // Fallback to individual env vars
  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  };
}

const svc = loadServiceAccount();

// Safe diagnostics (no private key content)
const hasProjectId = typeof svc?.projectId === "string" && svc.projectId.length > 0;
const hasClientEmail = typeof svc?.clientEmail === "string" && svc.clientEmail.length > 0;
const hasPrivateKey = typeof svc?.privateKey === "string" && svc.privateKey.includes("BEGIN PRIVATE KEY");
if (!hasProjectId || !hasClientEmail || !hasPrivateKey) {
  console.error("Firebase Admin credentials check:", {
    hasProjectId,
    hasClientEmail,
    hasPrivateKey,
    projectIdPreview: svc?.projectId || null,
    clientEmailPreview: svc?.clientEmail || null,
    privateKeyLength: typeof svc?.privateKey === "string" ? svc.privateKey.length : 0,
    source: process.env.FIREBASE_SERVICE_ACCOUNT ? "FIREBASE_SERVICE_ACCOUNT" : "ENV_VARS",
  });
  throw new Error(
    "Missing or invalid Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT or individual FIREBASE_ADMIN_* vars."
  );
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: svc?.projectId,
    clientEmail: svc?.clientEmail,
    privateKey: svc?.privateKey,
  }),
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseAdminConfig);
export const adminDb = getFirestore(app);
