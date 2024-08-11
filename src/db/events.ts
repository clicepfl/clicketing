'use server';

import { Event } from '@prisma/client';
import { notFound } from 'next/navigation';
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
  } catch (e) {
    console.error(e);
    return Err(ApiError.Internal);
  }
}

export async function updateEvent(event: Event): Promise<ApiResult<Event>> {
  if (!(await hasValidAdminSession())) {
    return Err(ApiError.Forbidden);
  }

  try {
    const updatedEvent: Event = await prisma.event.update({
      where: { id: event.id },
      data: event,
    });

    return Ok(updatedEvent);
  } catch (error) {
    console.error(error);
    return Err(ApiError.Internal);
  }
}

export async function setMailTemplate(event: string, template: string) {
  if (!(await hasValidAdminSession())) {
    return Err(ApiError.Forbidden);
  }

  await prisma.event.update({
    where: { id: event },
    data: { mailTemplate: template },
  });
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

export async function getEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (event === null) {
    notFound();
  }

  return event;
}
