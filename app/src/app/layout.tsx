import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { UserProvider } from "@/lib/user-context";
import { Header } from "@/components/header";
import { GlobalChatbot } from "@/components/chat/global-chatbot";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GiveFlow - AI + Blockchain Transparent Charity Platform",
  description: "透明、可追溯的区块链公益捐赠平台，AI 驱动的凭证审核，确保每一分钱都用在刀刃上。",
  keywords: ["charity", "blockchain", "monad", "AI", "transparent donation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <UserProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-emerald-500/20 bg-slate-950/50 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                  <p>
                    Built with 💚 on{" "}
                    <span className="text-emerald-400">Monad</span> •{" "}
                    AI-Powered Transparency
                  </p>
                </div>
              </footer>
              {/* Global Chatbot - appears on all pages */}
              <GlobalChatbot />
            </div>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
