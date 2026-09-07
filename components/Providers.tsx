"use client";

import { SessionProvider } from "next-auth/react";
import ChatWidget from "@/components/chat/ChatWidget";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus>
      {children}
      <ChatWidget />
    </SessionProvider>
  );
}
