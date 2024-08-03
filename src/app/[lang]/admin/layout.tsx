'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getVerifiedAdminSession } from '../../../session';
import { buildUrl } from '../../../utils';

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
