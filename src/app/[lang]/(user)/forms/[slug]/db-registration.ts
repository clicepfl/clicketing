'use server';

import prisma from '../../../../../db';
import { ApiError, ApiResult, Err, Ok } from '../../../../../utils';

export async function registerParticipant(
  event: string,
  user: { name: string; surname: string; email: string }
): Promise<ApiResult<null>> {
  const count = await prisma.registration.count({
    where: {
      eventId: event,
      email: user.email,
    },
  });
  if (count > 0) {
    return Err(ApiError.AlreadyRegistered);
  }

  await prisma.registration.create({
    data: {
      eventId: event,
      name: user.name,
      surname: user.surname,
      email: user.email,
      checkedIn: false,
      isStaff: false,
      data: {},
    },
  });

  return Ok(null);
}
