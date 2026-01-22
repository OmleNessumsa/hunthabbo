import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'iBOOD Mansion - Virtual Shopping Experience',
  description: 'Explore our luxurious virtual mansion and discover amazing deals from iBOOD!',
  keywords: ['iBOOD', 'deals', 'shopping', 'virtual', 'mansion', 'Habbo'],
  authors: [{ name: 'iBOOD' }],
  openGraph: {
    title: 'iBOOD Mansion - Virtual Shopping Experience',
    description: 'Explore our luxurious virtual mansion and discover amazing deals!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1a1a2e" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
