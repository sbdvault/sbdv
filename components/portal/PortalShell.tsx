"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

const navItems = [
  { key: "overview", href: "/portal", icon: LayoutDashboard },
  { key: "holdings", href: "/portal/holdings", icon: Wallet },
  { key: "performance", href: "/portal/performance", icon: TrendingUp },
  { key: "documents", href: "/portal/documents", icon: FileText },
  { key: "messages", href: "/portal/messages", icon: MessageSquare },
  { key: "settings", href: "/portal/settings", icon: Settings },
];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const { t, locale } = useTranslations();
  const { data: session } = useSession();
  const params = useParams();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <div className="min-h-screen bg-off-white flex">
      <aside className="w-64 bg-charcoal text-off-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-off-white/10">
          <Link href={getLocalizedHref("/")} className="flex items-center gap-3">
            <Logo height={48} className="shrink-0" />
            <span className="font-heading text-lg">{t("portal.title")}</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const href = getLocalizedHref(item.href);
            const isActive =
              pathname === href ||
              (item.href !== "/portal" && pathname?.startsWith(href));
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
                <item.icon className="w-5 h-5" />
                {t(`portal.nav.${item.key}`)}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href={getLocalizedHref("/admin")}
              className="flex items-center gap-3 px-4 py-3 rounded-sm font-body text-sm text-gold hover:bg-gold/10 transition-colors mt-2 border border-gold/30"
            >
              <Shield className="w-5 h-5" />
              {t("portal.nav.admin")}
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-off-white/10">
          <button
            onClick={() => signOut({ callbackUrl: getLocalizedHref("/") })}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-sm font-body text-sm text-off-white/70 hover:bg-off-white/10 hover:text-off-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t("portal.nav.logout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
