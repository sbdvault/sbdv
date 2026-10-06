/** Portal path after sign-in for a given locale + Auth.js role. */
export function pathForRole(locale: string, role: string | undefined | null): string {
  const loc = locale || "en";
  if (role === "ADMIN") return `/${loc}/admin`;
  if (role === "BORROWER") return `/${loc}/capital-access/portal`;
  return `/${loc}/portal`;
}
