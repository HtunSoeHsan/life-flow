import './globals.css';
import { Inter } from 'next/font/google';
import ClientProvider from '../components/ClientProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Blood Bank Management System</title>
        <meta name="description" content="Comprehensive Blood Bank Management System with Hospital Integration" />
      </head>
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}