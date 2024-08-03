'use client';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  function deleteAdminSession() {
    throw new Error('Function not implemented.');
  }

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
