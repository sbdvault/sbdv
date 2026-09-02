import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return <PortalShell>{children}</PortalShell>;
}
