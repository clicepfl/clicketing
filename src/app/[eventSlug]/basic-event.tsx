import BasicForm from '@/components/forms/BasicForm';
import { Event } from '@/types/aliases';

export default async function BasicEvent({ event }: { event: Event }) {
  let date = new Date(event.from).toLocaleDateString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <BasicForm
      event={event}
      date={`${date}`}
      location="BC Building"
      deposit={`${event.price ?? 0}CHF`}
    />
  );
}
