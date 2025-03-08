import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';
import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';

export default async function AdminPanel({ params }) {
  return (
    <div>
      <h1>Admin panel</h1>
      <Link href={`${params.admin}/checkin`}>Check-in</Link>
      <Link href={`${params.admin}/attendance`}>Attendance</Link>
    </div>
  );
}

export async function generateMetadata(
  { params, searchParams },
  parent: ResolvingMetadata
): Promise<Metadata> {
  let event: Event = (
    await directus().request(
      readItems('events', {
        fields: [
          // Explicit list to avoid leaking the admin secret
          'name',
        ],
        filter: {
          slug: params.eventSlug,
        },
      })
    )
  )[0];

  return {
    title: `${event.name} - Admin panel`,
  };
}
