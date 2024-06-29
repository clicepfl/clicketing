'use client';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  return (
    <>
      <p>Dashboard</p>
      <button
        onClick={async () => {
          await fetch(new URL('/api/logout?type=admin', window.location.href), {
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
