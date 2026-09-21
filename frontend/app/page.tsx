import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">
            Match
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Find people who enjoy the same things you do.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Match helps students and young professionals find activity
            partners and friends based on shared interests, availability, and
            location.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              Create an account
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Shared interests"
            description="Discover people who enjoy the same hobbies and activities."
          />

          <FeatureCard
            title="Nearby connections"
            description="Find potential friends in your city or local area."
          />

          <FeatureCard
            title="Meaningful conversations"
            description="Connect first, then chat when both people agree."
          />
        </div>
      </section>
    </main>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </article>
  );
}