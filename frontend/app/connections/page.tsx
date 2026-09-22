'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface OtherUser {
  id: string;
  name?: string;
  nickname?: string;
  city?: string;
}

interface ConnectionRecord {
  id: string;
  connectionStatus: string;
  createdAt: string;
  updatedAt: string;
  otherUser: OtherUser;
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

function displayName(user?: OtherUser) {
  return user?.nickname || user?.name || 'MATCH user';
}

export default function ConnectionsPage() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getSessionToken, getServerSnapshot);

  const [requests, setRequests] = useState<ConnectionRecord[]>([]);
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);
  const [blockedConnections, setBlockedConnections] = useState<ConnectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      if (!sessionStorage.getItem('accessToken')) router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    Promise.all([
      api<ConnectionRecord[]>('/connections/requests', { token }),
      api<ConnectionRecord[]>('/connections', { token }),
      api<ConnectionRecord[]>('/connections/blocked', { token }),
    ])
      .then(([pending, accepted, blocked]) => {
        if (!isMounted) return;
        setRequests(Array.isArray(pending) ? pending : []);
        setConnections(Array.isArray(accepted) ? accepted : []);
        setBlockedConnections(Array.isArray(blocked) ? blocked : []);
        setError(null);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load connections.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function updateRequest(connectionId: string, action: 'accept' | 'decline') {
    if (!token) return;
    setProcessingId(connectionId);
    setError(null);

    try {
      await api(`/connections/${connectionId}/${action}`, { method: 'PATCH', token });
      const request = requests.find((item) => item.id === connectionId);
      setRequests((current) => current.filter((item) => item.id !== connectionId));
      if (action === 'accept' && request) {
        setConnections((current) => [...current, { ...request, connectionStatus: 'ACCEPTED' }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} request.`);
    } finally {
      setProcessingId(null);
    }
  }

  async function openConversation(connectionId: string) {
    if (!token) return;
    setProcessingId(connectionId);
    setError(null);

    try {
      const conversation = await api<{ id: string }>('/conversations', {
        method: 'POST',
        token,
        body: JSON.stringify({ connectionId }),
      });
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open conversation.');
      setProcessingId(null);
    }
  }

  async function removeConnection(connectionId: string) {
    if (!token || !window.confirm('Remove this connection?')) return;
    setProcessingId(connectionId);
    setError(null);

    try {
      await api(`/connections/${connectionId}`, { method: 'DELETE', token });
      setConnections((current) => current.filter((item) => item.id !== connectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove connection.');
    } finally {
      setProcessingId(null);
    }
  }

  async function blockConnection(connectionId: string) {
    if (!token || !window.confirm('Block this user? They will disappear from Discover.')) return;
    setProcessingId(connectionId);
    setError(null);

    try {
      await api(`/connections/${connectionId}/block`, { method: 'PATCH', token });
      const connection = connections.find((item) => item.id === connectionId);
      setConnections((current) => current.filter((item) => item.id !== connectionId));
      if (connection) setBlockedConnections((current) => [...current, { ...connection, connectionStatus: 'BLOCKED' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block connection.');
    } finally {
      setProcessingId(null);
    }
  }

  async function unblockConnection(connectionId: string) {
    if (!token || !window.confirm('Unblock this user? They can appear in Discover again.')) return;
    setProcessingId(connectionId);
    setError(null);

    try {
      await api(`/connections/${connectionId}/unblock`, { method: 'PATCH', token });
      setBlockedConnections((current) => current.filter((item) => item.id !== connectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock connection.');
    } finally {
      setProcessingId(null);
    }
  }

  function logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    router.push('/login');
  }

  if (!token) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white"><p className="text-slate-400">Redirecting to login...</p></main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <p className="text-sm font-medium text-indigo-400">MATCH</p>
            <h1 className="mt-1 text-3xl font-bold">Connections</h1>
            <p className="mt-2 text-slate-400">Manage requests, connections, and blocked users.</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link href="/discover" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Discover</Link>
            <Link href="/profile" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Profile</Link>
            <button type="button" onClick={logout} className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10">Log out</button>
          </nav>
        </header>

        {error && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        {loading ? <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">Loading connections...</div> : <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Pending requests</h2><span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm text-amber-300">{requests.length}</span></div>
            {requests.length === 0 ? <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">You have no pending requests.</div> : <div className="grid gap-4 md:grid-cols-2">{requests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h3 className="text-lg font-semibold">{displayName(request.otherUser)}</h3>{request.otherUser.city && <p className="mt-1 text-sm text-slate-400">📍 {request.otherUser.city}</p>}<div className="mt-5 flex gap-2"><button type="button" disabled={processingId === request.id} onClick={() => updateRequest(request.id, 'accept')} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-50">Accept</button><button type="button" disabled={processingId === request.id} onClick={() => updateRequest(request.id, 'decline')} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50">Decline</button></div></article>)}</div>}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Your connections</h2>
            {connections.length === 0 ? <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">You do not have any accepted connections yet.</div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{connections.map((connection) => <article key={connection.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h3 className="text-lg font-semibold">{displayName(connection.otherUser)}</h3>{connection.otherUser.city && <p className="mt-1 text-sm text-slate-400">📍 {connection.otherUser.city}</p>}<div className="mt-5 grid grid-cols-2 gap-2"><button type="button" disabled={processingId === connection.id} onClick={() => openConversation(connection.id)} className="rounded-lg bg-indigo-600 px-3 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-50">Message</button><button type="button" disabled={processingId === connection.id} onClick={() => removeConnection(connection.id)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50">Remove</button><button type="button" disabled={processingId === connection.id} onClick={() => blockConnection(connection.id)} className="col-span-2 rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50">Block</button></div></article>)}</div>}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Blocked users</h2>
            {blockedConnections.length === 0 ? <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">You have not blocked anyone.</div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{blockedConnections.map((connection) => <article key={connection.id} className="rounded-2xl border border-red-500/20 bg-slate-900 p-5"><h3 className="text-lg font-semibold">{displayName(connection.otherUser)}</h3>{connection.otherUser.city && <p className="mt-1 text-sm text-slate-400">📍 {connection.otherUser.city}</p>}<button type="button" disabled={processingId === connection.id} onClick={() => unblockConnection(connection.id)} className="mt-5 w-full rounded-lg border border-emerald-500/40 px-4 py-2 font-semibold text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50">Unblock</button></article>)}</div>}
          </section>
        </div>}
      </div>
    </main>
  );
}