'use client';

import { useActionState } from 'react';
import { checkPassword } from '@/app/projects/object-based-attention/collaborators/actions';

const initialState = { error: '' };

export default function CollaboratorLogin() {
  const [state, formAction, pending] = useActionState(checkPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded border px-3 py-2 text-sm bg-transparent outline-none focus:ring-1"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            // @ts-expect-error CSS custom property
            "--tw-ring-color": "var(--accent)",
          }}
        />
      </div>

      {state?.error && (
        <p className="text-xs" style={{ color: "#e05252" }}>{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 rounded text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        {pending ? 'Checking…' : 'Sign in'}
      </button>
    </form>
  );
}
