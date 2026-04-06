import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ClerkProvider } from "@clerk/nextjs";
import { plPL } from "@clerk/localizations";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Premiere Time - Track Your Shows",
  description: "Monitor the release of your favourite series",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={plPL}>
      <html lang="pl" className="h-full antialiased text-[#05070e] bg-[#05070e]">
        <body className={`${montserrat.className} min-h-full flex flex-col bg-[#05070e] text-gray-100`}>
          <Providers>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <footer className="w-full text-center py-8 border-t border-white/5 opacity-80 mt-auto">
              <p className="text-[10px] uppercase font-medium tracking-[0.25em] text-gray-500 hover:text-gray-300 transition-colors duration-500 drop-shadow-md">
                 Zaprojektowano i stworzono przez MAKI
              </p>
            </footer>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
