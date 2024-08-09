'use server';

import prisma from '../db';
import { hasValidAdminSession } from '../session';
import { ApiError, ApiResult, Err, Ok } from '../utils';

function convertNameToSlug(name: string) {
  return name.replaceAll(/[_ ]/g, '-').toLocaleLowerCase();
}

export async function createEvent(event: {
  name: string;
  slug: string;
  directusId: number;
  startTime: string;
  endTime: string;
}): Promise<ApiResult<Event>> {
  if (!(await hasValidAdminSession())) {
    return Err(ApiError.Forbidden);
  }

  console.log(event.startTime, typeof event.startTime);

  const e: Event = await prisma.event.create({
    data: {
      name: event.name,
      slug: event.slug || convertNameToSlug(event.name),
      directusId: event.directusId.toString(),
      mailTemplate: '',
      eventStartTime: new Date(event.startTime).toISOString(),
      eventEndTime: new Date(event.endTime).toISOString(),
      staffingTimeSlotSize: 30,
      data: {},
    },
  });

  return Ok(e);
}
