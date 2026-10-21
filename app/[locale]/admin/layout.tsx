import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import {
  derivePublicOrigin,
  isAccountHolder,
  isAdminHostName,
  resolvePublicOrigin,
} from "@/lib/admin-host";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerList.get("host") ||
    "";
  const adminHost = isAdminHostName(host);
  const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    forwardedProto ||
    (isAdminHostName(host) || host.includes("localhost") ? "http" : "https");
  const requestOrigin = host ? `${proto}://${host}` : resolvePublicOrigin();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(adminHost ? "/login" : `/${locale}/login`);
  }

  const siteOrigin = adminHost
    ? derivePublicOrigin(requestOrigin)
    : requestOrigin.replace(/\/$/, "");

  return (
    <AdminShell
      isAdminHost={adminHost}
      isAccountHolder={isAccountHolder(session.user.email)}
      publicOrigin={siteOrigin}
      locale={locale}
    >
      {children}
    </AdminShell>
  );
}
