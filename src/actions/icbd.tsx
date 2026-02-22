'use server';

import { directus } from '@/directus';
import { ICBDActivityRegistration, Registration } from '@/types/aliases';
import { createItems, readItem, readItems, updateItem } from '@directus/sdk';

export async function sendICBDActivitiesRegistrations({
  activitiesIDs,
  noSlotActivitiesIDs,
  registrationID,
}) {
  let activities = await directus().request(
    readItems('icbd_activities', {
      fields: ['*', { translations: ['*'] }],
    })
  );

  let registration = await directus().request(
    readItem('registrations', registrationID, {
      //@ts-expect-error
      fields: ['*', { translations: ['*'] }],
    })
  );

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

export async function completeRegistration(id: string, hasInterview: boolean) {
  if (hasInterview) {
    await directus().request(
      updateItem('registrations', id, { registration_complete: true })
    );
  } else {
    await directus().request(
      updateItem('registrations', id, {
        registration_complete: true,
        registration_email_sent: true,
        payment: 'not-needed',
        retreived_deposit: true,
        can_retreive_deposit: false,
      })
    );
  }
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

export async function getICBDActivities(eventId: number) {
  const event = (
    await directus().request(
      readItems('events', {
        filter: { id: { _eq: eventId } },
        limit: -1,
      })
    )
  )[0];

  let target_id =
    typeof event.icbd_event === 'number'
      ? event.icbd_event
      : event.icbd_event?.id;
  if (target_id === null) return null;

  const activities = (
    await directus().request(
      readItem('icbd', target_id, {
        fields: [
          { activities: ['id', { translations: ['*'] }, 'timeslots', 'type'] },
        ],
      })
    )
  ).activities;

  return activities;
}
