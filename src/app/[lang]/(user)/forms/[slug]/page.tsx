'use server';

import { Simple } from './simple';
import { notFound } from 'next/navigation';
import { cleanTranslations, directus } from '../../../../../directus/directus';
import { readItem } from '@directus/sdk';
import { prisma } from '../../../../../prisma';

export default async function Page({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const event = await prisma.event.findUnique({ where: { slug: params.slug } });
  const news = await directus().request(
    readItem('news', event.directusId, {
      // @ts-ignore
      fields: ['*', { translations: ['*'] }],
    })
  );

  if (event == null) {
    notFound();
  }

  let form;
  switch (event.type) {
    case 'OTHER': {
      form = (
        <Simple event={event} news={cleanTranslations(news, params.locale)} />
      );
    }
  }

  return form;
}
