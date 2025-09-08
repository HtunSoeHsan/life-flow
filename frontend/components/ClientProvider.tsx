'use client';

import { ConfigProvider } from 'antd';
import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#dc2626',
          colorSuccess: '#16a34a',
          colorWarning: '#ea580c',
          colorError: '#dc2626',
          borderRadius: 8,
          fontFamily: inter.style.fontFamily,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
