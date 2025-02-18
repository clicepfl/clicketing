import ICBDForm from '@/components/ICBDForm';
import { directus, INTERNAL_DIRECTUS_URL } from '@/directus';
import { getTranslation } from '@/locales';
import { readItems } from '@directus/sdk';

export default async function Home() {
  let db_activities = await directus().request(
    readItems('icbd_activities', {
      //@ts-expect-error
      fields: ['id', { translations: ['*'] }, 'timeslots', 'type'],
    })
  );
  console.log(JSON.stringify(db_activities, null, 2));
  console.log(INTERNAL_DIRECTUS_URL);

  let activities = db_activities.map((a) => {
    const infos = getTranslation(a, 'en-US');
    const time = `${a.timeslots[0].start_time.substring(0, 5)} - ${a.timeslots[0].end_time.substring(0, 5)}`;
    const room = a.timeslots[0].room;

    return {
      id: infos.id,
      title: infos.name,
      description: infos.description,
      type: 'talk',
      time: time,
      room: room,
    };
  });

  let talks = activities.filter((a) => a.type === 'talk');
  let discussions = activities.filter((a) => a.type === 'discussion');

  return (
    <ICBDForm
      date="11/03/2025"
      location="BC Building"
      caution="10CHF Caution"
      talks={talks}
      discussions={discussions}
    ></ICBDForm>
  );
}
