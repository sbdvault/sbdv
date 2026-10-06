"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.includes("/portal") && !pathname?.includes("/capital-access");
  const isCapitalPortal = pathname?.includes("/capital-access/portal");
  const isAdmin = pathname?.includes("/admin");
  const isLogin = pathname?.includes("/login");
  const isCapRegister = pathname?.includes("/capital-access/register");

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.scrollBehavior = "smooth";
    }
  }, []);

  if (isPortal || isAdmin || isCapitalPortal) {
    return <>{children}</>;
  }

  if (isLogin || isCapRegister) {
    return (
      <>
        <Preloader />
        <main id="main-content" className="min-h-screen">{children}</main>
      </>
    );
  }

  return (
    <>
      <Preloader />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold focus:text-charcoal focus:font-medium focus:rounded-sm"
      >
        Skip to main content
      </a>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main id="main-content" className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
}
