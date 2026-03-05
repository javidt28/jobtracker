import Link from "next/link";

export function GuestBanner() {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--accent)]/10 px-6 py-3 text-center text-sm text-[var(--foreground)]">
      You’re exploring in guest mode. Data is not saved.{" "}
      <Link href="/signup" className="font-medium text-[var(--accent)] underline transition-opacity hover:no-underline hover:opacity-90">
        Sign up
      </Link>{" "}
      to keep your applications in sync.
    </div>
  );
}
