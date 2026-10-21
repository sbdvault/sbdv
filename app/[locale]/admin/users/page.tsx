import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminUsersPage from "@/components/admin/AdminUsersPage";
import { isAccountHolder, isAdminHostName } from "@/lib/admin-host";

export default async function UsersPage({
  params,
}: {
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

  if (!session?.user || session.user.role !== "ADMIN" || !isAccountHolder(session.user.email)) {
    redirect(adminHost ? "/" : `/${locale}/admin`);
  }

  return <AdminUsersPage />;
}
