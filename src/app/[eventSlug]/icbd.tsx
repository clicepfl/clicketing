import ICBDForm from '@/components/forms/ICBDForm';
import { directus } from '@/directus';
import { getTranslation } from '@/locales';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';

export default async function ICBD({ event }: { event: Event }) {
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

  let date = new Date(event.from).toLocaleDateString('fr-FR');

  return (
    <ICBDForm
      eventId={event.id.toString()}
      date={`${date}`}
      location="BC Building"
      deposit={`${event.price ?? 0}CHF Deposit`}
      talks={talks}
      discussions={discussions}
      interviews={interviews}
      cvCorrection={cvCorrection}
    />
  );
}
