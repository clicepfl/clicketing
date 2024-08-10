'use server';

import { Event } from '@prisma/client';
import prisma from '../db';
import { hasValidAdminSession } from '../session';
import { ApiError, ApiResult, Err, Ok } from '../utils';

function convertNameToSlug(name: string) {
  return name.replaceAll(/[_ ]/g, '-').toLocaleLowerCase();
}

export async function createEvent(event: Event): Promise<ApiResult<Event>> {
  if (!(await hasValidAdminSession())) {
    return Err(ApiError.Forbidden);
  }

  try {
    const e: Event = await prisma.event.create({
      data: event,
    });

    return Ok(e);
  } catch (_) {
    return Err(ApiError.Internal);
  }
}

export async function getUsedSlugs(): Promise<ApiResult<string[]>> {
  if (!(await hasValidAdminSession())) {
    return Err(ApiError.Forbidden);
  }

  try {
    return Ok(
      (await prisma.event.findMany({ select: { slug: true } })).map(
        (v) => v.slug
      )
    );
  } catch (_) {
    return Err(ApiError.Internal);
  }
}
