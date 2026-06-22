import type { Metadata } from "next";
import { Space_Grotesk, Inter , Silkscreen } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const silkscreen = Silkscreen({
  weight: '400', // You must specify 400 for 'Regular'
  subsets: ['latin'],
  variable: '--font-silkscreen',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Veri0G | 0G Compute Proof Explorer",
  description:
    "Verify your AI inference results instantly. Transpose complex 0G TEE attestations and ZK proofs into simple, human-readable trust metrics.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${silkscreen.variable}`}>
      <body
        className="font-sans antialiased bg-[#FDF8F5] text-[#1C1941] overflow-x-hidden"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}