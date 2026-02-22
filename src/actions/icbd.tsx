'use server';

import { directus } from '@/directus';
import {
  ICBDActivity,
  ICBDActivityRegistration,
  Registration,
} from '@/types/aliases';
import { createItems, readItem, readItems, updateItem } from '@directus/sdk';
import { ICBDInterviewStatus, ICBDTimeslot } from './icbd-client';

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

export async function getICBDActivities(eventId: number, filter?) {
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
        ...(filter !== undefined ? { filter } : {}),
      })
    )
  ).activities;

  return activities;
}

function getICBDActivityId(activity: ICBDActivity | number) {
  return typeof activity === 'number' ? activity : activity.id;
}

/**
 * Returns all of the ICBD activities of type interview that a participant
 * is registered for, along with the possible start times for those activities
 * (timeslots that are not yet full).
 */
export async function getICBDInterviewsForParticipant(
  registrationId: string,
  eventId: number
): Promise<ICBDInterviewStatus[]> {
  const activities = (await getICBDActivities(eventId)) || [];

  const interviewActivities = activities.filter((a) => a.type === 'interview');
  const activityIds = interviewActivities.map((a) => a.id);

  if (activityIds.length === 0) return [];

  const registrations = await directus().request(
    readItems('icbd_activities_registrations', {
      fields: ['*', { icbd_activity: ['id'] }],
      filter: {
        registration: { _eq: registrationId },
        icbd_activity: { _in: activityIds },
      },
      limit: -1,
    })
  );

  if (!registrations || registrations.length === 0) return [];

  const result = registrations
    .map((reg) => {
      const activity = interviewActivities.find(
        (a) => a.id === getICBDActivityId(reg.icbd_activity)
      );
      if (!activity) return null;

      const timeslots = activity.timeslots as {
        room: string;
        start_time: string;
        end_time: string;
        custom_name?: string;
        max_attendees?: number;
        full?: boolean;
      }[];

      let timeslot =
        reg.start && timeslots
          ? timeslots.find((ts) => ts.start_time === reg.start)
          : undefined;

    // allow the currently assigned timeslot even if it's full
    const availableTimeslots = timeslots
        ? timeslots.filter((ts) => !ts.full || ts.start_time === reg.start)
        : [];

      return {
        activity: {
          id: activity.id,
          name: activity.translations?.[0]?.name,
          type: activity.type,
        },
        timeslot,
        availableTimeslots,
      };
    })
    .filter((r) => r !== null);

  return result;
}

/**
 * Updates the timeslot of a participant for a given interview activity.
 * If the participant is not yet registered for the activity, does nothing.
 * If timeslot is null, removes the assigned timeslot
 * (but does not unregister the participant from the activity).
 */
export async function updateICBDInterviewTimeslot(
  registrationId: string,
  activityId: number,
  timeslot: ICBDTimeslot | null
) {
  const registrations = await directus().request(
    readItems('icbd_activities_registrations', {
      fields: ['*'],
      filter: {
        registration: { _eq: registrationId },
        icbd_activity: { _eq: activityId },
      },
      limit: -1,
    })
  );

  if (!registrations || registrations.length === 0) {
    // participant is not registered for this activity, fail silently
    return;
  }

  const reg = registrations[0];

  await directus().request(
    updateItem('icbd_activities_registrations', reg.id, {
      start: timeslot ? timeslot.start_time : null,
    })
  );
}
