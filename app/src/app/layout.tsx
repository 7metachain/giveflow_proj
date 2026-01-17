import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { UserProvider } from "@/lib/user-context";
import { Header } from "@/components/header";
import { GlobalChatbot } from "@/components/chat/global-chatbot";

const nunito = Nunito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SHE³ - 为她赋能 | 农村女性健康公益平台",
  description: "SHE³ 是专注于农村女性健康与教育的区块链公益平台。通过 AI 驱动的透明审核和 Monad 链上存证，让每一份爱心都被看见，让每一位女性都被关爱。",
  keywords: ["女性公益", "女性健康", "农村女性", "区块链捐赠", "AI透明", "Monad", "SHE3"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${nunito.variable} ${nunitoSans.variable} antialiased`}
      >
        <Providers>
          <UserProvider>
            <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
              <Header />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-[#E8E2D9] bg-white py-10">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col items-center gap-5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🌸</span>
                      <span className="text-2xl font-bold she3-logo">
                        SHE<sup>³</sup>
                      </span>
                    </div>
                    <p className="text-center text-sm text-[#8A7B73] max-w-md leading-relaxed">
                      为她的健康，为她的梦想，为她的未来。
                      <br />
                      每一份捐赠，都是改变生命的力量。
                    </p>
                    <div className="flex items-center gap-6 text-xs text-[#B8A99A]">
                      <span>Built with 💕 on <span className="text-[#C4866B]">Monad</span></span>
                      <span>•</span>
                      <span>AI-Powered Transparency</span>
                    </div>
                  </div>
                </div>
              </footer>
              {/* Global Chatbot */}
              <GlobalChatbot />
            </div>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
