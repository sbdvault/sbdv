"use client";

import { useSession } from "next-auth/react";

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name || email || "").trim();
  if (!source) return "?";

  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  const local = email!.split("@")[0] || "?";
  return local.slice(0, 2).toUpperCase();
}

export default function SignedInIdentity({ caption }: { caption: string }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="px-4 py-4 border-b border-off-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-sm bg-off-white/5 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-off-white/10 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-2.5 w-16 rounded bg-off-white/10" />
            <div className="h-3.5 w-28 rounded bg-off-white/10" />
          </div>
        </div>
      </div>
    );
  }

  const name = session?.user?.name?.trim() || null;
  const email = session?.user?.email?.trim() || null;
  if (!name && !email) return null;

  const primary = name || email!;
  const secondary = name && email && name !== email ? email : null;
  const initials = getInitials(name, email);

  return (
    <div className="px-4 py-4 border-b border-off-white/10">
      <div className="flex items-center gap-3 px-3 py-2 rounded-sm bg-off-white/5">
        <div
          className="w-9 h-9 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center shrink-0"
          aria-hidden
        >
          <span className="font-body text-xs font-medium text-gold tracking-wide">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-body text-xs text-off-white/50 truncate">{caption}</p>
          <p className="font-body text-sm text-off-white truncate" title={primary}>
            {primary}
          </p>
          {secondary && (
            <p className="font-body text-xs text-off-white/45 truncate" title={secondary}>
              {secondary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
