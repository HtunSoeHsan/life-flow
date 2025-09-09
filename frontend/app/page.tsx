'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const authData = JSON.parse(auth);
      if (authData.user.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/hospital');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">LifeFlow</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}