import ICBDForm from '@/components/ICBDForm';
import { directus } from '@/directus';
import { getTranslation } from '@/locales';
import { readItem, readItems } from '@directus/sdk';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export default async function Home({ params }) {
  let eventId = params.eventId;

  let events = await directus().request(
    readItems('events', {
      //@ts-expect-error
      fields: ['*', { translations: ['*'] }],
    })
  );

  let event = events
    .filter((event) => event.opened)
    .find((e) => e.id == eventId);

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
  let cvcorrections = activities.filter(
    (a) => a !== null && a.type == 'cv_correction'
  );

  return (
    <ICBDForm
      eventId={eventId}
      date="11/03/2025"
      location="BC Building"
      deposit="10CHF Deposit"
      talks={talks}
      discussions={discussions}
      interviews={interviews}
      cvcorrections={cvcorrections}
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
