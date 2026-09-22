'use client';

import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
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

export default function MessagesPage() {
  const router = useRouter();
  const params = useParams<{ connectionId: string }>();
  const token = useSyncExternalStore(subscribe, getSessionToken, getServerSnapshot);
  const conversationId = params.connectionId;

  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      if (!sessionStorage.getItem('accessToken')) router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (!token || !conversationId) return;

    let isMounted = true;

    api<MessageRecord[]>(`/conversations/${conversationId}/messages?limit=50`, { token })
      .then((data) => {
        if (isMounted) setMessages(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load messages.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    api(`/conversations/${conversationId}/messages`, {
      method: 'PATCH',
      token,
    }).catch(() => {});

    const intervalId = window.setInterval(() => {
      api<MessageRecord[]>(`/conversations/${conversationId}/messages?limit=50`, { token })
        .then((data) => {
          if (isMounted) setMessages(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [token, conversationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();

    if (!token || !conversationId || !trimmedContent) return;

    setSending(true);
    setError(null);

    try {
      const message = await api<MessageRecord>(
        `/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          token,
          body: JSON.stringify({ content: trimmedContent }),
        },
      );

      setMessages((current) => [...current, message]);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  function logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    router.push('/login');
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-400">MATCH</p>
            <h1 className="mt-1 text-2xl font-bold">Conversation</h1>
          </div>
          <nav className="flex gap-2">
            <Link href="/connections" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Connections</Link>
            <button type="button" onClick={logout} className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10">Log out</button>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-6">
        {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-5">
          {loading ? (
            <p className="text-center text-slate-400">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-slate-400">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                <p className="whitespace-pre-wrap break-words text-slate-100">{message.content}</p>
                <p className="mt-2 text-right text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
          <input
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a message..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
            maxLength={2000}
          />
          <button type="submit" disabled={sending || !content.trim()} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </section>
    </main>
  );
}
