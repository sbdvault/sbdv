"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Landmark,
  Crown,
  ArrowRightLeft,
  Users,
  UserCheck,
  LogOut,
  Globe,
  HandCoins,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

const navItems = [
  { key: "overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { key: "sovereign", href: "/admin/sovereign", icon: Landmark },
  { key: "privateWealth", href: "/admin/private-wealth", icon: Crown },
  { key: "directives", href: "/admin/directives", icon: ArrowRightLeft },
  { key: "capitalAccess", href: "/admin/capital-access", icon: HandCoins },
  { key: "applications", href: "/admin/applications", icon: UserCheck },
  { key: "clients", href: "/admin/clients", icon: Users },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { t, locale } = useTranslations();
  const { data: session } = useSession();
  const params = useParams();
  const pathname = usePathname();

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <div className="min-h-screen bg-off-white flex">
      <aside className="w-72 bg-charcoal text-off-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-off-white/10">
          <Link href={getLocalizedHref("/")} className="flex items-center gap-3">
            <Logo height={48} className="shrink-0" />
            <div>
              <span className="font-heading text-lg block leading-tight">
                {t("admin.platformTitle")}
              </span>
              <span className="font-body text-xs text-gold/80">{t("admin.platformBadge")}</span>
            </div>
          </Link>
        </div>

        <div className="px-4 py-4 border-b border-off-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-sm bg-off-white/5">
            <Globe className="w-4 h-4 text-gold shrink-0" />
            <div className="min-w-0">
              <p className="font-body text-xs text-off-white/50 truncate">
                {t("admin.signedInAs")}
              </p>
              <p className="font-body text-sm text-off-white truncate">
                {session?.user?.name || session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const href = getLocalizedHref(item.href);
            const isActive = item.exact
              ? pathname === href
              : pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={item.key}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm font-body text-sm transition-colors ${
                  isActive
                    ? "bg-gold text-charcoal"
                    : "text-off-white/70 hover:bg-off-white/10 hover:text-off-white"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {t(`admin.nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-off-white/10 space-y-1">
          <Link
            href={getLocalizedHref("/portal")}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-sm font-body text-sm text-off-white/70 hover:bg-off-white/10 hover:text-off-white transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            {t("admin.nav.clientPortal")}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: getLocalizedHref("/") })}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-sm font-body text-sm text-off-white/70 hover:bg-off-white/10 hover:text-off-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t("admin.nav.logout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 min-h-screen">
        <header className="sticky top-0 z-10 bg-off-white/95 backdrop-blur border-b border-charcoal/10 px-8 py-4">
          <p className="font-body text-xs uppercase tracking-widest text-gold">
            {t("admin.platformBadge")}
          </p>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
