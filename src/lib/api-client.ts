function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiCreateJob(body: Record<string, unknown>): Promise<{ id: string }> {
  const res = await fetch(apiUrl("/api/jobs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Failed to create job");
  }
  return res.json();
}

export async function apiUpdateJob(id: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(apiUrl(`/api/jobs/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Failed to update job");
  }
}

export async function apiUpdateJobStatus(id: string, status: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/jobs/${id}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Failed to update status");
  }
}

export async function apiDeleteJob(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/jobs/${id}`), { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Failed to delete job");
  }
}

export async function apiSignIn(email: string, password: string): Promise<{ redirect: string }> {
  const res = await fetch(apiUrl("/api/auth/signin"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Sign in failed");
  return data as { redirect: string };
}

export async function apiSignUp(
  email: string,
  password: string,
  name?: string
): Promise<{ redirect: string }> {
  const res = await fetch(apiUrl("/api/auth/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Sign up failed");
  return data as { redirect: string };
}

export async function apiSignOut(): Promise<{ redirect: string }> {
  const res = await fetch(apiUrl("/api/auth/signout"), { method: "POST" });
  const data = await res.json().catch(() => ({}));
  return data as { redirect: string };
}

export async function apiFirebaseSession(idToken: string): Promise<{ redirect: string }> {
  const res = await fetch(apiUrl("/api/auth/firebase-session"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Session failed");
  return (data as { redirect?: string })?.redirect != null
    ? { redirect: (data as { redirect: string }).redirect }
    : { redirect: "/dashboard" };
}

export async function apiFirebaseSignOut(): Promise<{ redirect: string }> {
  const res = await fetch(apiUrl("/api/auth/firebase-signout"), { method: "POST" });
  const data = await res.json().catch(() => ({}));
  return data as { redirect: string };
}
