interface StatCardProps {
  label: string;
  value: number | string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="border-l-4 border-[var(--accent)] pl-4">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {value}
        </p>
      </div>
    </div>
  );
}
