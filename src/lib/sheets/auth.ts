import { cookies } from "next/headers";
import { compare, hash } from "bcryptjs";
import { getSheetsClient, hasSheetConfig } from "./client";

const USERS_SHEET = "users";
const SESSIONS_SHEET = "sessions";
const SESSION_DAYS = 30;

export const SESSION_COOKIE_NAME = "pipeline_session";

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export interface SheetUser {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export async function getUserByEmail(email: string): Promise<(SheetUser & { password_hash: string }) | null> {
  if (!hasSheetConfig()) return null;
  const { sheets, sheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${USERS_SHEET}!A2:E`,
  });
  const rows = (res.data.values ?? []) as string[][];
  const normalized = email.trim().toLowerCase();
  const row = rows.find((r) => (r[1] ?? "").toLowerCase() === normalized);
  if (!row?.length) return null;
  return {
    id: row[0] ?? "",
    email: row[1] ?? "",
    password_hash: row[2] ?? "",
    name: row[3] || null,
    created_at: row[4] ?? now(),
  };
}

export async function createUser(email: string, password: string, name?: string): Promise<SheetUser> {
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("An account with this email already exists");

  const { sheets, sheetId } = getSheetsClient();
  const id = uuid();
  const password_hash = await hash(password, 10);
  const created = now();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${USERS_SHEET}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[id, email.trim().toLowerCase(), password_hash, name?.trim() ?? "", created]],
    },
  });
  return { id, email: email.trim().toLowerCase(), name: name?.trim() || null, created_at: created };
}

export async function verifyPassword(email: string, password: string): Promise<SheetUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const ok = await compare(password, user.password_hash);
  return ok ? { id: user.id, email: user.email, name: user.name, created_at: user.created_at } : null;
}

export async function createSession(userId: string): Promise<string> {
  const { sheets, sheetId } = getSheetsClient();
  const id = uuid();
  const token = crypto.randomUUID();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SESSIONS_SHEET}!A:D`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[id, userId, token, expires.toISOString()]],
    },
  });
  return token;
}

export async function getSessionByToken(token: string): Promise<SheetUser | null> {
  if (!hasSheetConfig() || !token) return null;
  const { sheets, sheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SESSIONS_SHEET}!A2:D`,
  });
  const rows = (res.data.values ?? []) as string[][];
  const nowIso = new Date().toISOString();
  const session = rows.find((r) => r[2] === token && (r[3] ?? "") > nowIso);
  if (!session) return null;

  const usersRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${USERS_SHEET}!A2:E`,
  });
  const userRows = (usersRes.data.values ?? []) as string[][];
  const userRow = userRows.find((r) => r[0] === session[1]);
  if (!userRow) return null;
  return {
    id: userRow[0] ?? "",
    email: userRow[1] ?? "",
    name: userRow[3] || null,
    created_at: userRow[4] ?? now(),
  };
}

export async function getCurrentUser(token: string | undefined): Promise<SheetUser | null> {
  if (!token) return null;
  return getSessionByToken(token);
}

/** Use in server components/layout to get the logged-in sheet user (from session cookie). */
export async function getSheetSessionUser(): Promise<SheetUser | null> {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getCurrentUser(token);
}

export async function deleteSession(token: string): Promise<void> {
  if (!hasSheetConfig() || !token) return;
  const { sheets, sheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SESSIONS_SHEET}!A2:D`,
  });
  const rows = (res.data.values ?? []) as string[][];
  const rowIndex = rows.findIndex((r) => r[2] === token);
  if (rowIndex < 0) return;

  const sheetRes = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sessSheet = sheetRes.data.sheets?.find((s) => s.properties?.title === SESSIONS_SHEET);
  const sheetIdNum = sessSheet?.properties?.sheetId;
  if (sheetIdNum == null) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetIdNum,
              dimension: "ROWS",
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });
}
