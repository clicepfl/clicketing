import { directus } from '@/directus';
import { readItems } from '@directus/sdk';
import { CheckIn } from './CheckIn';

export default async function Page({ params }) {
  const eventSlug = params.eventSlug;

  const event = (
    await directus().request(
      readItems('events', {
        filter: { slug: { _eq: eventSlug } },
        limit: -1,
      })
    )
  )[0];

  const registrations = await directus().request(
    readItems('registrations', {
      filter: { event: { slug: { _eq: eventSlug } } },
      limit: -1,
    })
  );

  return <CheckIn event={event} participants={registrations} />;
}
