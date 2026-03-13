import BasicForm from '@/components/forms/BasicForm';
import ClosedForm from '@/components/forms/ClosedForm';
import FacultyDinnerForm from '@/components/forms/FacultyDinnerForm';
import HelloWorldForm from '@/components/forms/HelloWorldForm';
import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Clothes from './clothes';
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
          'intro_text',
          'confirmation_text',
          'background_color',
          'icbd_event',
          'location',
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
    return <ClosedForm />;
  }

  switch (event.type) {
    case 'icbd':
      return <ICBD event={event}></ICBD>;
    case 'faculty_dinner':
      return (
        <FacultyDinnerForm event={event} guest={false} />
      );
    case 'hello_world':
      return <HelloWorldForm event={event} />;
    case 'faculty_clothes_sale':
      return <Clothes event={event}></Clothes>;
    default:
      return <BasicForm event={event} />;
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
