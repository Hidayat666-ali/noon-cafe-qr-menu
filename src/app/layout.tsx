import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MenuProvider } from '@/lib/menu-context';

export const metadata: Metadata = {
  title: 'NOON CAFE — Digital Menu | Kismatpur, Hyderabad',
  description: 'Explore the full menu of Noon Cafe, Kismatpur, Hyderabad. Fresh snacks, hot sips, crushers, coolers, shakes & frappés, and Noon specials.',
  icons: {
    icon: '/images/noon-logo.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#141416',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-noon-dark text-gray-100 antialiased selection:bg-noon-500 selection:text-white">
        <MenuProvider>
          {children}
        </MenuProvider>
      </body>
    </html>
  );
}
