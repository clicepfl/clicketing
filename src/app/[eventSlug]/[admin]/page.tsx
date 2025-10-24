import Card from '@/components/Card';
import ClipboardCheckIcon from '@/components/icons/ClipboardCheckIcon';
import PriceIcon from '@/components/icons/PriceIcon';
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
          <Link href={`${params.admin}/payment`}>
            <Card Icon={PriceIcon}>Payment</Card>
          </Link>
          <Link href={`${params.admin}/checkin`}>
            <Card Icon={TicketIcon}>Check-in</Card>
          </Link>
          <Link href={`${params.admin}/icbd/attendance`}>
            <Card Icon={ClipboardCheckIcon}>Attendance</Card>
          </Link>
        </div>
      );

    case 'faculty_dinner':
      return (
        <div className="form">
          <h1>Admin panel</h1>
          <Link href={`${params.admin}/payment`}>
            <Card Icon={PriceIcon}>Payment</Card>
          </Link>
          <Link href={`${params.admin}/checkin`}>
            <Card Icon={TicketIcon}>Check-in</Card>
          </Link>
        </div>
      );

    case 'hello_world':
      return (
        <div className="form">
          <h1>Admin panel</h1>
          <Link href={`${params.admin}/checkin`}>
            <Card Icon={TicketIcon}>Check-in</Card>
          </Link>
        </div>
      );

    default:
      return (
        <div className="form">
          <h1>Admin panel</h1>
          <Link href={`${params.admin}/payment`}>
            <Card Icon={PriceIcon}>Payment</Card>
          </Link>
          <Link href={`${params.admin}/checkin`}>
            <Card Icon={TicketIcon}>Check-in</Card>
          </Link>
        </div>
      );
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
