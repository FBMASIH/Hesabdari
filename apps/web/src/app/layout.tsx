import type { Metadata } from 'next';
import { Providers } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hesabdari - Enterprise Accounting Platform',
  description: 'Enterprise-grade web accounting platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
