"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface DashboardShellProps {
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function DashboardShell({ sidebarContent, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const logo = (
    <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
      JobsPipeline
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 z-20 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 pt-[env(safe-area-inset-top)] md:hidden" style={{ boxShadow: "var(--shadow-sm)", minHeight: "calc(3.5rem + env(safe-area-inset-top))" }}>
        {logo}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--foreground)] hover:bg-[var(--muted)]"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar: drawer on mobile, fixed on desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--card)] transition-transform duration-200 ease-out
          md:translate-x-0 md:max-w-none
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-5 md:justify-start">
          {logo}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--foreground)] hover:bg-[var(--muted)] md:hidden"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          {sidebarContent}
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content-mobile min-w-0 flex-1 md:pl-64 md:pt-0">
        {children}
      </main>
    </div>
  );
}
