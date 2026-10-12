import BasicForm from '@/components/forms/BasicForm';
import ClosedForm from '@/components/forms/ClosedForm';
import FacultyDinnerForm from '@/components/forms/FacultyDinnerForm';
import HelloWorldForm from '@/components/forms/HelloWorldForm';
import IcelanForm from '@/components/forms/IcelanForm';
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
          'name',
          'slug',
          'from',
          'to',
          'type',
          'price_model',
          'first_price',
          'second_price',
          'opened',
          'intro_text',
          'confirmation_text',
          'location',
          'meals',
          'icbd_event',
          'background_color',
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
      return <ICBD event={event} />;
    case 'faculty_dinner':
      return <FacultyDinnerForm event={event} guest={false} />;
    case 'hello_world':
      return <HelloWorldForm event={event} />;
    case 'faculty_clothes_sale':
      return <Clothes event={event} />;
    case 'icelan':
      return (
        <IcelanForm
          event={event}
          tournaments={await directus().request(readItems('icelan_tournois'))}
        />
      );
    default:
      return <BasicForm event={event} />;
  }
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const event = (
    await directus().request(
      readItems('events', {
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
