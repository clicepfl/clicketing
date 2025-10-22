import ClosedForm from '@/components/forms/ClosedForm';
import FacultyDinnerForm from '@/components/forms/FacultyDinnerForm';
import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export default async function GuestForm({ params }) {
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
    return <ClosedForm />;
  }

  switch (event.type) {
    case 'faculty_dinner':
      return (
        <FacultyDinnerForm event={event} location="BC Building" guest={true} />
      );
    default:
      return notFound();
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
    title: `${event.name} - Guest Registration`,
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
