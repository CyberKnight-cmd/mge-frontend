import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import FooterWrapper from '@/components/layout/FooterWrapper';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Mayank Global Exports | Industrial Metals Exchange',
    template: '%s | Mayank Global Exports',
  },
  description:
    'Institutional-grade B2B marketplace for catalytic converter recycling and Platinum, Palladium, Rhodium precious metal trade.',
  keywords: ['catalytic converter', 'precious metals', 'platinum', 'palladium', 'rhodium', 'B2B metals exchange'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Mayank Global Exports',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <FooterWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
