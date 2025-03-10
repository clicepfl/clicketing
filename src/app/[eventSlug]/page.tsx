import ICBDForm from '@/components/ICBDForm';
import { directus } from '@/directus';
import { getTranslation } from '@/locales';
import { Event } from '@/types/aliases';
import { readItem, readItems } from '@directus/sdk';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

  let db_activities = await directus().request(
    readItems('icbd_activities', {
      //@ts-expect-error
      fields: ['id', { translations: ['*'] }, 'timeslots', 'type'],
    })
  );

  let activities = db_activities.map((a) => {
    if (a.timeslots === null) {
      return null;
    }

    const infos = getTranslation(a, 'en-US');
    const time = `${a.timeslots[0].start_time.substring(0, 5)} - ${a.timeslots[0].end_time.substring(0, 5)}`;
    const room = a.timeslots[0].room;

    return {
      id: a.id,
      title: infos.name,
      description: infos.description,
      type: a.type,
      time: time,
      room: room,
    };
  });

  let talks = activities.filter((a) => a !== null && a.type == 'talk');
  let discussions = activities.filter(
    (a) => a !== null && a.type == 'discussion'
  );
  let interviews = activities.filter(
    (a) => a !== null && a.type == 'interview'
  );
  let cvCorrections = activities.filter(
    (a) => a !== null && a.type == 'cv_correction'
  );

  // Assert only one cv_correction activity
  if (cvCorrections.length != 1) {
    throw new Error(
      `Exactly one CV Correction activity expected, {cvCorrections.length} found`
    );
  }

  let cvCorrection = cvCorrections[0];

  return (
    <ICBDForm
      eventId={event.id.toString()}
      date="11/03/2025"
      location="BC Building"
      deposit="10CHF Deposit"
      talks={talks}
      discussions={discussions}
      interviews={interviews}
      cvCorrection={cvCorrection}
    />
  );
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const event = await directus().request(
    readItem('events', params.eventId, {
      //@ts-expect-error
      fields: ['*', { translations: ['*'] }],
    })
  );

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
