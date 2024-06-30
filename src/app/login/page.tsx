'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createAdminSession } from '../../session';

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
          onClick={async () => {
            if (!(await createAdminSession(token))) {
              setError('Login failed');
              return;
            }

            router.push(returnUrl || '/admin');
          }}
        >
          Login
        </button>
        <p>{error}</p>
      </>
    );
  }

  throw new Error('Invalid login type');
}
