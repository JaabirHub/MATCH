'use client';

import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

interface ProfileResponse {
  id: string;
  nickname: string;
  city: string;
  description: string;
  interests: string[];
}

function subscribe() {
  return () => {};
}
function getSessionToken() {
  return sessionStorage.getItem('accessToken');
}
function getServerSnapshot() {
  return null;
}

export default function ProfilePage() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getSessionToken, getServerSnapshot);

  const [nickname, setNickname] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('accessToken');
      if (!stored) {
        router.push('/login');
        return;
      }
    }

    if (!token) return;

    let isMounted = true;

    api<ProfileResponse>('/profile/me', { token })
      .then((data) => {
        if (isMounted && data) {
          setNickname(data.nickname || '');
          setCity(data.city || '');
          setDescription(data.description || '');
          setSelectedInterests(Array.isArray(data.interests) ? data.interests : []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setStatusMessage({
            type: 'error',
            text: err instanceof Error ? err.message : 'Failed to load profile.',
          });
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
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
    setStatusMessage(null);

    if (selectedInterests.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please choose at least one interest.' });
      return;
    }

    setSaving(true);
    try {
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

      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save changes.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (!token || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Profile & Preferences</h1>
            <p className="mt-1 text-sm text-slate-400">
              Update your details anytime to refine your matches
            </p>
          </div>
          <Link
            href="/discover"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            ← Back to Discover
          </Link>
        </div>

        {statusMessage && (
          <div
            className={`mt-6 rounded-lg px-4 py-3 text-sm ${
              statusMessage.type === 'success'
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border border-red-500/30 bg-red-500/10 text-red-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="nickname" className="mb-2 block text-sm font-medium text-slate-200">
              Display Name
            </label>
            <input
              id="nickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">
              Your Interests
            </label>
            <div className="flex flex-wrap gap-2">
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

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </main>
  );
}