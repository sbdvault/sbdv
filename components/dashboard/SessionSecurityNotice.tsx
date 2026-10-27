"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { isLoopbackIp, normalizeClientIp } from "@/lib/sign-in-display";

type SignInSnapshot = {
  at: string;
  ip: string | null;
  location: string | null;
};

type SecurityResponse = {
  currentSignIn: SignInSnapshot | null;
  previousSignIn: SignInSnapshot | null;
};

function formatWhen(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function placeAndIp(
  snapshot: SignInSnapshot,
  localLabel: string
): { place: string | null; ip: string | null } {
  const ip = normalizeClientIp(snapshot.ip);
  const place =
    snapshot.location || (isLoopbackIp(snapshot.ip) ? localLabel : null);
  return { place, ip };
}

function SessionMeta({
  label,
  snapshot,
  locale,
  localLabel,
}: {
  label: string;
  snapshot: SignInSnapshot;
  locale: string;
  localLabel: string;
}) {
  const { place, ip } = placeAndIp(snapshot, localLabel);

  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-charcoal/40 mr-1">{label}</span>
      <span className="text-charcoal/80">{formatWhen(snapshot.at, locale)}</span>
      {place && (
        <>
          <span className="text-charcoal/25" aria-hidden>·</span>
          <span className="text-charcoal/70">{place}</span>
        </>
      )}
      {ip && (
        <>
          <span className="text-charcoal/25" aria-hidden>·</span>
          <span className="font-mono text-charcoal/80">{ip}</span>
        </>
      )}
    </span>
  );
}

export default function SessionSecurityNotice() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<SecurityResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/security", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: SecurityResponse | null) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data?.currentSignIn) return null;

  const localLabel = t("accountSecurity.summary.localNetwork");

  return (
    <div className="flex items-center justify-end gap-3 min-w-0 font-body text-[11px] leading-none text-charcoal">
      <SessionMeta
        label={t("accountSecurity.summary.thisSignIn")}
        snapshot={data.currentSignIn}
        locale={locale}
        localLabel={localLabel}
      />
      {data.previousSignIn && (
        <>
          <span className="h-3 w-px bg-charcoal/15 shrink-0" aria-hidden />
          <SessionMeta
            label={t("accountSecurity.summary.previousSignIn")}
            snapshot={data.previousSignIn}
            locale={locale}
            localLabel={localLabel}
          />
        </>
      )}
    </div>
  );
}
