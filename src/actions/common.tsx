'use server';

import { directus } from '@/directus';
import { Registration } from '@/types/aliases';
import { readItem, readItems, updateItem } from '@directus/sdk';

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

export async function getRegistrations(eventId: string) {
  return await directus().request(
    readItems('registrations', { filter: { event: { _eq: eventId } } })
  );
}

export async function getRegistration(id: string) {
  try {
    return await directus().request(readItem('registrations', id));
  } catch (e) {
    console.log(e);
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

export async function markPayment(
  registrationId: string,
  payment: string,
  sendConfirmationMail = true
): Promise<Registration> {
  return await directus().request(
    updateItem('registrations', registrationId, {
      payment,
      confirmation_email_sent: !sendConfirmationMail,
    })
  );
}
