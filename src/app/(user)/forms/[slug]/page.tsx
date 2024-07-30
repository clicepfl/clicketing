'use server';

import { PrismaClient } from '@prisma/client';
import { Simple } from './simple';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { slug: string } }) {
  const prisma = new PrismaClient();
  const event = await prisma.event.findUnique({ where: { slug: params.slug } });

  if (event == null) {
    notFound();
  }

  let form;
  switch (event.type) {
    case 'OTHER': {
      form = <Simple event={event} />;
    }
  }

  return form;
}
