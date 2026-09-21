'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('accessToken');
    if (!savedToken) {
      router.push('/login');
    } else {
      setToken(savedToken);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading || !token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading discover feed...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold">Discover Matches</h1>
            <p className="text-sm text-slate-400">
              People with shared interests in your area
            </p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('accessToken');
              router.push('/login');
            }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Log out
          </button>
        </header>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-300">
            Authenticated successfully! Ready to connect with the matching endpoint.
          </p>
        </section>
      </div>
    </main>
  );
}