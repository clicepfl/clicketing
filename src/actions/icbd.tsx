'use server';

import { directus } from '@/directus';
import { ICBDActivityRegistration, Registration } from '@/types/aliases';
import { createItems, readItem, readItems, updateItem } from '@directus/sdk';

export async function emailAlreadyUsed(
  email: string,
  eventId: string
): Promise<boolean> {
  const registrations = await directus().request(
    readItems('registrations', {
      filter: {
        _and: [{ email: { _eq: email } }, { event: { _eq: eventId } }],
      },
    })
  );

  return registrations.length !== 0;
}

export async function sendRegistration({
  first_name,
  last_name,
  email,
  section,
  year,
  eventId,
}) {
  const event = await directus().request(
    readItem('events', eventId, { fields: ['*'] })
  );

  const eventRegistration = {
    event,
    email,
    first_name,
    family_name: last_name,
    year,
    section,
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
    .filter((a) => noSlotActivitiesIDs.includes(a.id))
    .map((a) => {
      return { icbd_activity: a, registration, attended: false };
    });

  const activityRegistrations = activities
    .filter((a) => activitiesIDs.includes(a.id))
    .map((a) => {
      return {
        icbd_activity: a,
        registration,
        start: a.timeslots[0].start_time,
        attended: false,
      };
    });

  await directus().request(
    createItems('icbd_activities_registrations', [
      ...activityRegistrations,
      ...noSlotActivitiesRegistrations,
    ])
  );
}

export async function completeRegistration(id: string) {
  await directus().request(
    updateItem('registrations', id, { registration_complete: true })
  );
}

export async function getRegistrations(eventId: string) {
  return await directus().request(
    readItems('registrations', { filter: { event: { _eq: eventId } } })
  );
}

export async function getRegistration(id: string) {
  try {
    return await directus().request(readItem('registrations', id));
  } catch (e) {
    return null;
  }
}

export async function checkInRegistration(
  registrationId: string
): Promise<Registration> {
  return await directus().request(
    updateItem('registrations', registrationId, { checked_in: true })
  );
}

export async function returnDeposit(
  registrationId: string
): Promise<Registration> {
  return await directus().request(
    updateItem('registrations', registrationId, { retreived_deposit: true })
  );
}

export async function markAttendance(
  icbdRegistrationId: string
): Promise<ICBDActivityRegistration> {
  return await directus().request(
    updateItem('icbd_activities_registrations', icbdRegistrationId, {
      attended: true,
    })
  );
}
