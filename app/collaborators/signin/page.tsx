'use client';

import { use } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = use(searchParams);
  const denied = error === 'AccessDenied';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div
        className="w-full max-w-sm rounded-lg border p-8 space-y-6 text-center"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="space-y-1">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Collaborator Access
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in with your GitHub account to continue.
          </p>
        </div>

        {denied && (
          <p className="text-sm rounded p-3" style={{ background: 'var(--accent-dim)', color: 'var(--text-secondary)' }}>
            Your GitHub account is not on the collaborator list. Contact{' '}
            <a href="mailto:Generstoner@gmail.com" style={{ color: 'var(--accent)' }}>
              Generstoner@gmail.com
            </a>{' '}
            to request access.
          </p>
        )}

        <button
          onClick={() => signIn('github', { callbackUrl: '/projects/object-based-attention/collaborators/data' })}
          className="w-full py-2.5 px-4 rounded text-sm font-medium"
          style={{ background: '#24292e', color: '#fff' }}
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
