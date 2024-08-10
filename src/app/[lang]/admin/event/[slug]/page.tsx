import EventForm from '../../../../../components/EventForm';
import prisma from '../../../../../db';

export default async function Page({ params }: { params: { slug: string } }) {
  return (
    <EventForm
      initialValue={await prisma.event.findUnique({
        where: { slug: params.slug },
      })}
    />
  );
}
