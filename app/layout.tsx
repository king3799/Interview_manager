import type { Metadata } from "next";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Manager",
  description: "Manage your interview schedules efficiently",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
