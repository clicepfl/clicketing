import FacultyDinnerForm from '@/components/FacultyDinnerForm';
import { Event } from '@/types/aliases';

export default async function FacultyDinner({ event }: { event: Event }) {
  return (
    <FacultyDinnerForm
      eventId={event.id.toString()}
      date="03/04/2025"
      location="BC Building"
      deposit="10CHF"
    />
  );
}
