import ICBDForm from '@/components/forms/ICBDForm';
import { directus } from '@/directus';
import { getTranslation } from '@/locales';
import { Event } from '@/types/aliases';
import { readItem } from '@directus/sdk';

export default async function ICBD({ event }: { event: Event }) {
  let target_id =
    typeof event.icbd_event === 'number'
      ? event.icbd_event
      : event.icbd_event?.id;
  if (target_id === null) return null;

  let db_activities = (
    await directus().request(
      readItem('icbd', target_id, {
        fields: [
          { activities: ['id', { translations: ['*'] }, 'timeslots', 'type'] },
        ],
      })
    )
  ).activities;
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

  return (
    <ICBDForm
      event={event}
      location="BC Building"
      talks={talks}
      discussions={discussions}
      interviews={interviews}
    />
  );
}
