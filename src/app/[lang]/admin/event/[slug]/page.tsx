import { notFound } from 'next/navigation';
import EventForm from '../../../../../components/EventForm';
import prisma from '../../../../../db';

export default async function Page({ params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
  });

  if (event === null) {
    notFound();
  }

  return <EventForm initialValue={event} />;
}
