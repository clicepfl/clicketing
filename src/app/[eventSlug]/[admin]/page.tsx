import Card from '@/components/Card';
import ClipboardCheckIcon from '@/components/icons/ClipboardCheckIcon';
import PriceIcon from '@/components/icons/PriceIcon';
import TicketIcon from '@/components/icons/TicketIcon';
import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';
import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';

function eventSpecificAdminLinks(event: Event, adminBasePath: string) {
  switch (event.type) {
    case 'icbd':
      return (
        <>
          <Link href={`${adminBasePath}/payment`}>
            <Card Icon={PriceIcon}>Payment</Card>
          </Link>
          <Link href={`${adminBasePath}/icbd/attendance`}>
            <Card Icon={ClipboardCheckIcon}>Attendance</Card>
          </Link>
        </>
      );
    default:
      return (
        event.price > 0 && (
          <Link href={`${adminBasePath}/payment`}>
            <Card Icon={PriceIcon}>Payment</Card>
          </Link>
        )
      );
  }
}

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

  return (
    <div className="form">
      <h1>Admin panel</h1>
      {eventSpecificAdminLinks(event, params.admin)}
      <Link href={`${params.admin}/checkin`}>
        <Card Icon={TicketIcon}>Check-in</Card>
      </Link>
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
