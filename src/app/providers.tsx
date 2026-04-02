"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { isDemoMode } from "@/lib/demo/mode";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );

  if (isDemoMode) {
    return content;
  }

  return (
    <SessionProvider>
      {content}
    </SessionProvider>
  );
}
