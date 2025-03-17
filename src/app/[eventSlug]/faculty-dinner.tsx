import FacultyDinnerForm, { Meal } from '@/components/forms/FacultyDinnerForm';
import { Event } from '@/types/aliases';

export default async function FacultyDinner({ event }: { event: Event }) {
  let date = new Date(event.from).toLocaleDateString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <FacultyDinnerForm
      eventId={event.id.toString()}
      date={`${date}`}
      location="BC Building"
      deposit={`${event.price ?? 0}CHF`}
      meals={event.meals as Meal[]}
    />
  );
}
