import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getAuth() {
  const creds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (creds) {
    try {
      const key = JSON.parse(creds) as { client_email?: string; private_key?: string };
      return new google.auth.GoogleAuth({
        credentials: key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    } catch {
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON");
    }
  }
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    return new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  throw new Error("Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS");
}

export function getSheetsClient() {
  if (!SHEET_ID) throw new Error("Set GOOGLE_SHEET_ID in .env.local");
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, sheetId: SHEET_ID };
}

export function hasSheetConfig() {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") return false;
  return !!(
    process.env.GOOGLE_SHEET_ID &&
    (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS)
  );
}
