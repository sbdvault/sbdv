"use client";

import { useParams } from "next/navigation";
import AccountSecuritySettings from "@/components/dashboard/AccountSecuritySettings";
import { useTranslations } from "@/hooks/useTranslations";

export default function AdminSettingsPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const currentLocale = (params?.locale as string) || locale || "en";

  return (
    <AccountSecuritySettings
      title={t("admin.settings.title")}
      signOutHref={`/${currentLocale}/`}
    />
  );
}
