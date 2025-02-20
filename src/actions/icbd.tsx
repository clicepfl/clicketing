'use server';

import { directus } from '@/directus';
import { createItems, readItem, readItems } from '@directus/sdk';

export async function sendRegistration({
  first_name,
  last_name,
  email,
  section,
  year,
  eventID,
}) {
  const event = await directus().request(
    readItem('events', eventID, {
      fields: ['*'],
    })
  );

  const eventRegistration = {
    event: event,
    email: email,
    first_name: first_name,
    family_name: last_name,
    year: year,
    section: section,
    checked_in: false,
    retreived_deposit: false,
    can_retrieve_deposit: false,
    registration_complete: false,
  };

  const createdRegistration = await directus().request(
    createItems('registrations', [eventRegistration])
  );

  return createdRegistration[0].id;
}

export async function sendICBDActivitiesRegistrations({
  activitiesIDs,
  noSlotActivitiesIDs,
  registrationID,
}) {
  let activities = await directus().request(
    readItems('icbd_activities', {
      //@ts-expect-error
      fields: ['*', { translations: ['*'] }],
    })
  );

  let registrations = await directus().request(
    readItems('registrations', {
      //@ts-expect-error
      fields: ['*', { translations: ['*'] }],
    })
  );

  const registration = registrations.find((r) => r.id === registrationID);

  const noSlotActivitiesRegistrations = activities
    .filter((id) => noSlotActivitiesIDs.includes(id))
    .map((a) => {
      return {
        icbd_activity: a,
        registration: registration,
        attended: false,
      };
    });

  const activityRegistrations = activities
    .filter((a) => activitiesIDs.includes(a.id))
    .map((a) => {
      return {
        icbd_activity: a,
        registration: registration,
        start: a.timeslots[0].start_time,
        attended: false,
      };
    });

  await directus().request(
    createItems('icbd_activities_registrations', activityRegistrations)
  );
}

export async function getICBDInfo() {
  // const icbd = await directus().request(
  //   //@ts-ignore
  //   readSingleton('ICBD', { fields: ['*', { translations: ['*'] }] })
  // );
}
