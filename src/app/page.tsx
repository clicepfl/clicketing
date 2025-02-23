import Card from '@/components/Card';
import TicketIcon from '@/components/icons/TicketIcon';
import { directus } from '@/directus';
import { readItems } from '@directus/sdk';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export default async function Home({ params }) {
  let events = await directus().request(
    readItems('events', {
      //@ts-expect-error
      fields: ['*', { translations: ['*'] }],
    })
  );

  console.log(events);

  return (
    <div className="form">
      <h1>Open Event Forms</h1>
      {events
        .filter((event) => event.opened)
        .map((event) => (
          <a href={`/clicketing/${event.id}`}>
            <Card key={event.id} Icon={TicketIcon}>
              {event.name}
            </Card>
          </a>
        ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Clicketing',
};
