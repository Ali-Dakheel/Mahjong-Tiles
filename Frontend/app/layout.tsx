import type { Metadata } from 'next';
import { Cinzel } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '600', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mahjong Bet — Hand Betting Game',
  description: 'A mahjong hand betting game. Bet higher or lower on your next hand.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cinzel.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
