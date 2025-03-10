import Card from '@/components/Card';
import TicketIcon from '@/components/icons/TicketIcon';
import { directus } from '@/directus';
import { readItems } from '@directus/sdk';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home({ params }) {
  let events = await directus().request(
    readItems('events', {
      fields: [
        // Explicit list to avoid leaking the admin secret
        'id',
        'from',
        'to',
        'name',
        'slug',
        'type',
        //@ts-expect-error
        { translations: ['*'] },
      ],
    })
  );

  console.log(events);

  return (
    <div className="form">
      <h1>Open Event Forms</h1>
      {events
        .filter((event) => event.opened)
        .map((event) => (
          <Link href={`/${event.slug}`}>
            <Card key={event.id} Icon={TicketIcon}>
              {event.name}
            </Card>
          </Link>
        ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Clicketing',
};
