import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/auth/AuthContext';
import { ToastProvider } from '@/components/ui/ToastProvider';

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "Learnify - Personalized Learning Platform",
  description: "AI-powered personalized learning platform tailored for your unique learning style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`w-full h-full m-0 p-0 overflow-hidden ${playfair.variable}`}>
      <body className={`${inter.className} w-full h-full m-0 p-0`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
