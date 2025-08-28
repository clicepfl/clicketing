import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FacultyDinner from './faculty-dinner';
import HelloWorld from './hello-world';
import ICBD from './icbd';

export default async function Home({ params }) {
  let eventSlug = params.eventSlug;

  let event: Event = (
    await directus().request(
      readItems('events', {
        fields: [
          // Explicit list to avoid leaking the admin secret
          'id',
          'from',
          'to',
          'name',
          'slug',
          'type',
          'meals',
          'price',
          'opened',
          //@ts-expect-error
          { translations: ['*'] },
        ],
        filter: {
          slug: eventSlug,
        },
      })
    )
  )[0];

  if (!event) {
    return notFound();
  }

  if (!event.opened) {
    return (
      <div className="form">
        <h1>This form is not open</h1>
        <p>You're probably too late or too early ;)</p>
      </div>
    );
  }

  switch (event.type) {
    case 'icbd':
      return <ICBD event={event}></ICBD>;
    case 'faculty_dinner':
      return <FacultyDinner event={event}></FacultyDinner>;
    case 'hello_world':
      return <HelloWorld event={event}></HelloWorld>;
  }
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const event = (
    await directus().request(
      readItems('events', {
        //@ts-expect-error
        fields: ['*', { translations: ['*'] }],
        filter: { slug: params.eventSlug },
      })
    )
  )[0];

  return {
    title: `${event.name} - Registration`,
    openGraph: {
      type: 'website',
      siteName: 'Clicketing',
      title: `Register to ${event.name}`,
      url: `https://clic.epfl.ch/clicketing/${event.id}`,
      locale: 'en_US',
      images: [
        'https://clic.epfl.ch/directus/assets/43241404-0dff-4f17-989e-e0f156707266',
      ],
    },
  };
}
