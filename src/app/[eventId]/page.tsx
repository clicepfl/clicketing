import ICBDForm from '@/components/ICBDForm';
import { directus } from '@/directus';
import { getTranslation } from '@/locales';
import { readItems } from '@directus/sdk';
import { notFound } from 'next/navigation';

export default async function Home({ params }) {
  let eventId = params.eventId;

  let events = await directus().request(
    readItems('events', {
      //@ts-expect-error
      fields: ['*', { translations: ['*'] }],
    })
  );
  console.log(events);

  let event = events
    .filter((event) => event.opened)
    .find((e) => e.id == eventId);
  console.log(event);

  if (!event) {
    return notFound();
  }

  let db_activities = await directus().request(
    readItems('icbd_activities', {
      //@ts-expect-error
      fields: ['id', { translations: ['*'] }, 'timeslots', 'type'],
    })
  );
  console.log(db_activities);

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

  console.log(talks);
  console.log(discussions);
  console.log(interviews);

  return (
    <ICBDForm
      eventId={eventId}
      date="11/03/2025"
      location="BC Building"
      caution="10CHF Caution"
      talks={talks}
      discussions={discussions}
      interviews={interviews}
    ></ICBDForm>
  );
}
