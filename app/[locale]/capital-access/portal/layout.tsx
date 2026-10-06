import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CapitalAccessShell from "@/components/capital-access/CapitalAccessShell";

export default async function CapitalAccessPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/capital-access/portal`);
  }

  if (session.user.role !== "BORROWER" && session.user.role !== "ADMIN") {
    redirect(`/${locale}/portal`);
  }

  return <CapitalAccessShell>{children}</CapitalAccessShell>;
}
