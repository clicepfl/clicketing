import { Event, Registration } from '@/types/aliases';
import Card from './Card';
import Split from './Split';
import SplitText from './SplitText';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ErrorIcon from './icons/ErrorIcon';
import PriceIcon from './icons/PriceIcon';
import TicketIcon from './icons/TicketIcon';

export default function ParticipantDisplay({
  event,
  participant,
}: {
  event: Event;
  participant: Registration;
}) {
  switch (event.type) {
    case 'icbd':
      return <ICBDParticipantDisplay participant={participant} />;
    case 'faculty_dinner':
      return <SimpleParticipantDisplay participant={participant} />;
    case 'hello_world':
      return <SimpleParticipantDisplay participant={participant} />;
    default:
      return <SimpleParticipantDisplay participant={participant} />;
  }
}

function ICBDParticipantDisplay({
  participant,
}: {
  participant: Registration;
}) {
  return (
    <div className="participant-display">
      <SplitText
        snippets={[
          `${participant.first_name} ${participant.family_name}`,
          participant.email,
        ]}
      />

      {participant.payment !== null ? (
        participant.checked_in ? (
          <Card>
            <CheckCircleIcon className="icon" />
            Checked in
          </Card>
        ) : (
          <Card>
            <TicketIcon className="icon" />
            Deposit made, not checked in
          </Card>
        )
      ) : participant.checked_in ? (
        <Card>
          <ErrorIcon className="icon" />
          Checked in without deposit !!!
        </Card>
      ) : (
        <Card>
          <PriceIcon className="icon" />
          Deposit missing !
        </Card>
      )}
    </div>
  );
}

function SimpleParticipantDisplay({
  participant,
}: {
  participant: Registration;
}) {
  return (
    <div className="participant-display">
      <Split>
        <b>{`${participant.first_name} ${participant.family_name}`}</b>
        <span>{participant.email}</span>
      </Split>
    </div>
  );
}
