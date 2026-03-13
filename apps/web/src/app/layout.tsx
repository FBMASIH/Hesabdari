import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Providers } from '@/providers';
import './globals.css';

const vazirmatn = localFont({
  src: './fonts/Vazirmatn-variable.woff2',
  display: 'swap',
  variable: '--font-vazirmatn',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'حسابداری — سامانه جامع مالی',
  description: 'سامانه جامع حسابداری و مدیریت مالی سازمانی',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body className={vazirmatn.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
