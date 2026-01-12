// app/page.tsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = (await cookies()).get('session')?.value;

  // If logged in, go to dashboard home
  if (session) {
    redirect('/overview');
  }

  // Otherwise show a simple landing page
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--branch-teal)] p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Branch Dashboard</h1>
        <p className="text-sm text-gray-600">Demo landing page. Login to access the dashboard.</p>

        <div className="flex gap-2">
          <Link
            href="/login"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Login
          </Link>

          <a
            href="https://branch.io/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border px-4 py-2 text-sm text-gray-700"
          >
            Visit Branch.io
          </a>
        </div>
      </div>
    </main>
  );
}
