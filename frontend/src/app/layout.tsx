import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = { title: "DocAI", description: "Quản lý tài liệu thông minh" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
