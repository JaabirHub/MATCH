'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface MatchSuggestion {
  id: string;
  nickname: string;
  city: string;
  interests: string[];
  sharedInterests: string[];
  score: number;
}

interface ConnectionRecord {
  id: string;
  sender?: { id: string };
  receiver?: { id: string };
  connectionStatus?: string;
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

function formatInterest(interest: string) {
  return interest
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function DiscoverPage() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getSessionToken, getServerSnapshot);

  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const [pendingUserIds, setPendingUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('accessToken');
      if (!stored) router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    Promise.all([
      api<MatchSuggestion[]>(`/matches/suggestions?page=${page}&limit=10`, { token }),
      api<ConnectionRecord[]>('/connections', { token }),
      api<ConnectionRecord[]>('/connections/requests', { token }),
    ])
      .then(([matches, connections, pendingRequests]) => {
        if (!isMounted) return;

        const acceptedIds = connections.flatMap((connection) =>
          connection.sender?.id && connection.receiver?.id
            ? [connection.sender.id, connection.receiver.id]
            : [],
        );

        const pendingIds = pendingRequests.flatMap((connection) =>
          connection.sender?.id && connection.receiver?.id
            ? [connection.sender.id, connection.receiver.id]
            : [],
        );

        setConnectedUserIds(acceptedIds);
        setPendingUserIds(pendingIds);
        setSuggestions(Array.isArray(matches) ? matches : []);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load suggestions.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, page]);

  async function sendConnectionRequest(receiverId: string) {
    if (!token) return;

    setRequestingId(receiverId);
    setError(null);

    try {
      await api(`/connections/request/${receiverId}`, {
        method: 'POST',
        token,
      });

      setRequestedIds((current) => [...current, receiverId]);
      setPendingUserIds((current) => [...current, receiverId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send connection request.');
    } finally {
      setRequestingId(null);
    }
  }

  function logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    router.push('/login');
  }

  const visibleSuggestions = suggestions.filter(
    (match) => !connectedUserIds.includes(match.id) && !pendingUserIds.includes(match.id),
  );

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">MATCH</p>
            <h1 className="mt-1 text-3xl font-bold">Discover your matches</h1>
            <p className="mt-2 text-slate-400">
              Find people who share your interests and are close to you.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link href="/profile" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
              Profile
            </Link>
            <Link href="/connections" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
              Connections
            </Link>
            <button type="button" onClick={logout} className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10">
              Log out
            </button>
          </nav>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Finding your best matches...
          </div>
        ) : visibleSuggestions.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">No new matches found</h2>
            <p className="mt-2 text-slate-400">Update your profile or check back later for more suggestions.</p>
            <Link href="/profile" className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500">
              Update profile
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleSuggestions.map((match) => {
                const requestSent = requestedIds.includes(match.id);
                const isRequesting = requestingId === match.id;

                return (
                  <article key={match.id} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold">
                          {match.nickname.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="mt-4 text-xl font-semibold">{match.nickname}</h2>
                        <p className="mt-1 text-sm text-slate-400">📍 {match.city}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                        {match.score} score
                      </span>
                    </div>

                    <div className="mt-6 flex-1">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Shared interests</p>
                      <div className="flex flex-wrap gap-2">
                        {match.sharedInterests.length > 0 ? match.sharedInterests.map((interest) => (
                          <span key={interest} className="rounded-full bg-indigo-500/15 px-3 py-1 text-sm text-indigo-300">
                            {formatInterest(interest)}
                          </span>
                        )) : <span className="text-sm text-slate-500">No shared interests listed</span>}
                      </div>

                      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">All interests</p>
                      <div className="flex flex-wrap gap-2">
                        {match.interests.map((interest) => (
                          <span key={interest} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                            {formatInterest(interest)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button type="button" disabled={requestSent || isRequesting} onClick={() => sendConnectionRequest(match.id)} className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
                      {requestSent ? 'Request sent' : isRequesting ? 'Sending...' : 'Connect'}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button type="button" disabled={page === 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page}</span>
              <button type="button" disabled={suggestions.length < 10 || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
