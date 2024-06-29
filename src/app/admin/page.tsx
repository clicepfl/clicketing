'use client';

import { useRouter } from 'next/navigation';
import { buildURL } from '../../url';

export default function Dashboard() {
  const router = useRouter();

  return (
    <>
      <p>Dashboard</p>
      <button
        onClick={async () => {
          await fetch(buildURL('/api/logout?type=admin'), {
            method: 'POST',
            credentials: 'same-origin',
          });
          router.refresh();
        }}
      >
        Logout
      </button>
    </>
  );
}
