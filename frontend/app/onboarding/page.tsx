'use client';

import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const AVAILABLE_INTERESTS = [
  { key: 'gym', label: 'Gym & Fitness' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'music', label: 'Music' },
  { key: 'sports', label: 'Sports' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'activities', label: 'Outdoors & Activities' },
  { key: 'self_expression', label: 'Self Expression' },
  { key: 'night_life', label: 'Night Life' },
  { key: 'movies', label: 'Movies & Cinema' },
  { key: 'tv_series', label: 'TV Series' },
  { key: 'anime', label: 'Anime' },
  { key: 'manga', label: 'Manga' },
  { key: 'cartoons', label: 'Cartoons & Animation' },
  { key: 'books', label: 'Books & Literature' },
  { key: 'art', label: 'Art & Design' },
];

function subscribe() {
  return () => {};
}
function getSessionToken() {
  return sessionStorage.getItem('accessToken');
}
function getServerSnapshot() {
  return null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getSessionToken, getServerSnapshot);

  const [nickname, setNickname] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('accessToken');
      if (!stored) {
        router.push('/login');
      }
    }
  }, [token, router]);

  function toggleInterest(interestKey: string) {
    setSelectedInterests((prev) =>
      prev.includes(interestKey)
        ? prev.filter((item) => item !== interestKey)
        : [...prev, interestKey],
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (selectedInterests.length === 0) {
      setError('Please select at least one interest tag.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calls your Profile update endpoint (e.g. PATCH /profile or PUT /profile)
      await api('/profile', {
        method: 'PATCH',
        token: token || undefined,
        body: JSON.stringify({
          nickname,
          city,
          description,
          interests: selectedInterests,
        }),
      });

      router.push('/discover');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save profile. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading setup wizard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Step 2 of 2
          </p>
          <h1 className="mt-2 text-3xl font-bold">Complete your Profile</h1>
          <p className="mt-1 text-sm text-slate-400">
            Tell others about yourself so our algorithm can suggest compatible friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="nickname" className="mb-2 block text-sm font-medium text-slate-200">
              Display Name / Nickname
            </label>
            <input
              id="nickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="city" className="mb-2 block text-sm font-medium text-slate-200">
              City / Location
            </label>
            <input
              id="city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. London"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-200">
              Bio / About Me
            </label>
            <textarea
              id="description"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of activities or friends are you looking for?"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">
              Select Your Interests (Pick at least 1)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_INTERESTS.map(({ key, label }) => {
                const isSelected = selectedInterests.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleInterest(key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                        : 'border border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-500 px-4 py-3.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Profile...' : 'Save & Start Discovering'}
          </button>
        </form>
      </div>
    </main>
  );
}