'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { buildURL, getUrl } from '../../url';

async function adminLogin(
  token: string,
  router: AppRouterInstance,
  returnUrl: string | null,
  onError: () => void
) {
  // Construct the login url to call the API
  const url = buildURL('/api/login', { type: 'admin', token });

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin', // Allow the Set-Cookie header returned to take effect.
  });

  if (res.ok) {
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.push('/admin');
    }
  } else {
    onError();
  }
}

export default function Login() {
  const params = useSearchParams();
  const router = useRouter();
  const returnUrl = params.get('returnUrl');

  if (params.get('type') === 'admin') {
    const [token, setToken] = useState('');
    const [error, setError] = useState(null as string | null);

    return (
      <>
        <input value={token} onChange={(e) => setToken(e.target.value)} />
        <button
          onClick={() =>
            adminLogin(token, router, returnUrl, () => setError('Login failed'))
          }
        >
          Login
        </button>
        <p>{error}</p>
      </>
    );
  }

  throw new Error('Invalid login type');
}
