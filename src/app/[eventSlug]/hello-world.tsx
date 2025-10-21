import HelloWorldForm from '@/components/forms/HelloWorldForm';
import { Event } from '@/types/aliases';

export default async function HelloWorld({ event }: { event: Event }) {
  let date = new Date(event.from).toLocaleDateString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <HelloWorldForm
      eventId={event.id}
      date={`${date}`}
      location="BC Building"
      deposit={`${event.price ?? 0}CHF`}
    />
  );
}
