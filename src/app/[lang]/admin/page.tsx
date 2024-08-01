'use client';

import { useRouter } from 'next/navigation';
import { deleteAdminSession } from 'session';

export default function Dashboard() {
  const router = useRouter();

  return (
    <>
      <p>Dashboard</p>
      <button
        onClick={async () => {
          await deleteAdminSession();
          router.refresh();
        }}
      >
        Logout
      </button>
    </>
  );
}
