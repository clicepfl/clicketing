import Card from '@/components/Card';
import ClipboardCheckIcon from '@/components/icons/ClipboardCheckIcon';
import TicketIcon from '@/components/icons/TicketIcon';
import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';
import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';

export default async function AdminPanel({ params }) {
  let event: Event = (
    await directus().request(
      readItems('events', {
        fields: [
          // Explicit list to avoid leaking the admin secret
          'name',
          'type',
        ],
        filter: {
          slug: params.eventSlug,
        },
      })
    )
  )[0];

  switch (event.type) {
    case 'icbd':
      return (
        <div className="form">
          <h1>Admin panel</h1>
          <Link href={`${params.admin}/checkin`}>
            <Card Icon={TicketIcon}>Check-in</Card>
          </Link>
          <Link href={`${params.admin}/icbd/attendance`}>
            <Card Icon={ClipboardCheckIcon}>Attendance</Card>
          </Link>
        </div>
      );

    case 'sdf':
      return (
        <div className="form">
          <h1>Admin panel</h1>
          <Link href={`${params.admin}/checkin`}>
            <Card Icon={TicketIcon}>Check-in</Card>
          </Link>
        </div>
      );

    default:
      break;
  }
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
