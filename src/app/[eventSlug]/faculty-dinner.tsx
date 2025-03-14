import FacultyDinnerForm, { Meal } from '@/components/FacultyDinnerForm';
import { Event } from '@/types/aliases';

export default async function FacultyDinner({ event }: { event: Event }) {
  console.log('MEALS RIGHT HERE !!!!!!!!!!!!!!!!!');
  console.log(event.meals);

  return (
    <FacultyDinnerForm
      eventId={event.id.toString()}
      date="03/04/2025"
      location="BC Building"
      deposit="10CHF"
      meals={event.meals as Meal[]}
    />
  );
}
