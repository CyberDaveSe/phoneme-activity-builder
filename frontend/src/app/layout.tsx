import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ThemeLoader from "@/components/ThemeLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Phoneme Activity Builder",
  description: "Create phoneme-based classroom activities for Speech Pathology education",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <ThemeLoader />
        <Navigation />

        <main>
        {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
