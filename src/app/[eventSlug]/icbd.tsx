import { getICBDActivities } from '@/actions/icbd';
import ICBDForm from '@/components/forms/ICBDForm';
import { getTranslation } from '@/locales';
import { Event } from '@/types/aliases';

export default async function ICBD({ event }: { event: Event }) {
  let dbActivities = await getICBDActivities(event.id);

  let activities = dbActivities
    .sort((a, b) => {
      const at = getTranslation(a, 'en-US');
      const bt = getTranslation(b, 'en-US');
      if (at.name[0] == bt.name[0]) {
        return a.timeslots[0].start_time.localeCompare(
          b.timeslots[0].start_time
        );
      }
      return at.name[0].localeCompare(bt.name[0]);
    })
    .map((a) => {
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
