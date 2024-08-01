'use server';

import { headers } from 'next/headers';
import { getVerifiedAdminSession, verifyAdminSession } from '../../../session';
import { redirect } from 'next/navigation';
import { buildUrl } from '../../../url';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  const session = await getVerifiedAdminSession();
  if (session === null) {
    const currentUrl = headers().get('next-url');

    redirect(
      buildUrl('/login', {
        type: 'admin',
        returnUrl: currentUrl,
      }).toString()
    );
  }

  return children;
}
