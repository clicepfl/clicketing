import prisma from 'db';
import Link from 'next/link';

export default async function Page({ params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
  });

  return (
    <div>
      <p>Thanks for your registration to {event.name} !</p>
      <p>
        See your <Link href={`/forms/${event.slug}`}>registration</Link>
      </p>
    </div>
  );
}
