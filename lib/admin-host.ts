export const DEFAULT_ACCOUNT_HOLDER_EMAIL = "admin@sbdv.swiss";
export const ADMIN_DEFAULT_LOCALE = "en";

const localePrefix = "en|de|fr|it|nl|es|pt|ru|zh|ja|ko|ar";
const publicAdminPath = new RegExp(`^/(${localePrefix})/admin(/|$)`);
const loginPath = new RegExp(`^/(login|(${localePrefix})/login)$`);
const passwordPath = new RegExp(
  `^/((${localePrefix})/)?(forgot-password|reset-password)(/|$)`
);

type HeaderCarrier = {
  headers: { get(name: string): string | null };
};

export function accountHolderEmail(): string {
  return (process.env.ACCOUNT_HOLDER_EMAIL || DEFAULT_ACCOUNT_HOLDER_EMAIL)
    .trim()
    .toLowerCase();
}

export function isAccountHolder(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === accountHolderEmail();
}

export function hostnameOnly(host: string): string {
  return host.split(":")[0].trim().toLowerCase();
}

/**
 * Platform default hostnames cannot serve `admin.{host}` (Vercel has no
 * `admin.project.vercel.app`). Keep the admin app on the same origin there.
 */
const PLATFORM_PUBLIC_SUFFIXES = [
  ".vercel.app",
  ".now.sh",
  ".onrender.com",
  ".netlify.app",
  ".railway.app",
  ".fly.dev",
  ".herokuapp.com",
  ".pages.dev",
] as const;

export function isPlatformPublicHost(hostname: string): boolean {
  const host = hostnameOnly(hostname);
  return PLATFORM_PUBLIC_SUFFIXES.some(
    (suffix) => host === suffix.slice(1) || host.endsWith(suffix)
  );
}

export function isAdminHostName(hostname: string): boolean {
  const host = hostnameOnly(hostname);
  return host === "admin.localhost" || host.startsWith("admin.");
}

/** Separate admin host: localhost, custom domains, or NEXT_PUBLIC_ADMIN_URL. */
export function dedicatedAdminHostEnabled(hostname: string): boolean {
  const override = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "");
  if (override) {
    try {
      if (isPlatformPublicHost(new URL(override).hostname)) return false;
    } catch {
      /* ignore invalid override */
    }
    return true;
  }
  const host = hostnameOnly(hostname);
  if (isLoopbackHost(host) || isAdminHostName(host)) return true;
  return !isPlatformPublicHost(host);
}

export function requestHostname(request: HeaderCarrier): string {
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwarded || request.headers.get("host") || "";
  return hostnameOnly(host);
}

export function isAdminRequest(request: HeaderCarrier): boolean {
  return isAdminHostName(requestHostname(request));
}

function stripWww(hostname: string): string {
  return hostname.replace(/^www\./i, "");
}

export function deriveAdminOrigin(fromOrigin: string): string {
  const override = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "");
  if (override) return override;

  const url = new URL(fromOrigin);
  const host = url.hostname.toLowerCase();
  if (host === "admin.localhost" || host.startsWith("admin.")) {
    return url.origin;
  }
  if (host === "localhost" || host === "127.0.0.1") {
    url.hostname = "admin.localhost";
    return url.origin;
  }
  if (!dedicatedAdminHostEnabled(host)) {
    return url.origin;
  }
  url.hostname = `admin.${stripWww(host)}`;
  return url.origin;
}

/** Same-origin `/en/admin` on Vercel; `/` on a dedicated admin host. */
export function adminHomeHref(
  locale: string = ADMIN_DEFAULT_LOCALE,
  fromOrigin?: string
): string {
  const origin =
    fromOrigin ||
    (typeof window !== "undefined" ? window.location.origin : envSiteOrigin());
  const host = new URL(origin).hostname;
  if (isAdminHostName(host)) return "/";
  if (!dedicatedAdminHostEnabled(host)) return `/${locale}/admin`;
  return `${deriveAdminOrigin(origin)}/`;
}

export function shouldBounceAdminLogin(hostname: string): boolean {
  return dedicatedAdminHostEnabled(hostname) && !isAdminHostName(hostname);
}

function isLoopbackHost(hostname: string): boolean {
  const host = hostnameOnly(hostname);
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "admin.localhost" ||
    host.endsWith(".localhost")
  );
}

export function derivePublicOrigin(fromOrigin: string): string {
  const url = new URL(fromOrigin);
  const host = url.hostname.toLowerCase();

  // Local admin host must map to the local public site, even if
  // NEXT_PUBLIC_SITE_URL points at a deployed environment.
  if (isLoopbackHost(host)) {
    const port = url.port ? `:${url.port}` : "";
    return `http://localhost${port}`;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site) {
    try {
      if (!isLoopbackHost(new URL(site).hostname)) return site;
    } catch {
      /* ignore invalid env */
    }
  }

  if (host.startsWith("admin.")) {
    url.hostname = host.slice("admin.".length);
    return url.origin;
  }
  return url.origin;
}

function envSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Browser or server origin of the admin host. */
export function resolveAdminOrigin(): string {
  if (typeof window !== "undefined") {
    return deriveAdminOrigin(window.location.origin);
  }
  return deriveAdminOrigin(envSiteOrigin());
}

export function resolvePublicOrigin(fromOrigin?: string): string {
  if (fromOrigin) {
    return isAdminHostName(new URL(fromOrigin).hostname)
      ? derivePublicOrigin(fromOrigin)
      : fromOrigin.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return derivePublicOrigin(window.location.origin);
  }
  return envSiteOrigin();
}

export function isAdminLoginPath(pathname: string): boolean {
  return loginPath.test(pathname) || passwordPath.test(pathname);
}

export function isPublicAdminPath(pathname: string): boolean {
  return publicAdminPath.test(pathname);
}

/** `/en/admin/users` → `/users`, `/en/admin` → `/` */
export function publicAdminPathToHostPath(pathname: string): string {
  const match = pathname.match(new RegExp(`^/(${localePrefix})/admin(/.*)?$`));
  if (!match) return "/";
  return match[2] || "/";
}

export function adminHostRewritePath(
  pathname: string,
  locale: string = ADMIN_DEFAULT_LOCALE
): string {
  if (pathname === "/login") return `/${locale}/login`;
  if (pathname === "/forgot-password") return `/${locale}/forgot-password`;
  if (pathname === "/reset-password") return `/${locale}/reset-password`;
  if (loginPath.test(pathname) || passwordPath.test(pathname)) return pathname;
  if (isPublicAdminPath(pathname)) return pathname;

  const localeMatch = pathname.match(new RegExp(`^/(${localePrefix})(/.*)?$`));
  if (localeMatch) {
    const rest = localeMatch[2] || "/";
    if (rest === "/" || rest === "") return `/${localeMatch[1]}/admin`;
    return `/${locale}/admin`;
  }

  if (pathname === "/") return `/${locale}/admin`;
  return `/${locale}/admin${pathname}`;
}
