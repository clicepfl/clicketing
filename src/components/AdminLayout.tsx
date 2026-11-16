import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';
import { notFound } from 'next/navigation';

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<'/[eventSlug]/[admin]'>) {
  let event: Event = (
    await directus().request(
      readItems('events', {
        fields: [
          // Explicit list to avoid leaking the admin secret
          'admin_secret',
        ],
        filter: {
          slug: {
            _eq: (await params).eventSlug,
          },
        },
      })
    )
  )[0];

  if (event === undefined) {
    notFound();
  }

  if ((await params).admin !== event.admin_secret) {
    return <p>Forbidden</p>;
  } else {
    return <>{children}</>;
  }
}
