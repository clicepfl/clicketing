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
        <h1>This event is sold out!</h1>

        <p>
          But don't worry, more is to come :) <br />
          Follow us to keep updated on everything we're preparing : <br />
          <a href="https://linktr.ee/clicepfl">CLIC Linktree</a>
        </p>
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

  const imageUrl = event.banner
    ? `https://clic.epfl.ch/directus/assets/${event.banner}`
    : 'https://clic.epfl.ch/directus/assets/6b42cb6b-9556-46e8-9aae-e01526842e41';

  return {
    title: `${event.name} - Registration`,
    openGraph: {
      type: 'website',
      siteName: 'Clicketing',
      title: `Register to ${event.name}`,
      url: `https://clic.epfl.ch/clicketing/${event.id}`,
      locale: 'en_US',
      images: [imageUrl],
    },
  };
}
