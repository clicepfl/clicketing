import { Event, Registration } from '@/types/aliases';
import Card from './Card';
import Split from './Split';
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
  const deposit = event.type === 'icbd';
  const requiresPayment = event.price > 0 || deposit;
  return (
    <div className="participant-display">
      <Split>
        <b>{`${participant.first_name} ${participant.family_name}`}</b>
        <span>{participant.email}</span>
      </Split>

      {!requiresPayment || participant.payment !== null ? (
        participant.checked_in ? (
          <Card>
            <CheckCircleIcon className="icon" />
            Checked in
          </Card>
        ) : (
          <Card>
            <TicketIcon className="icon" />
            {requiresPayment
              ? deposit
                ? 'Deposit made - Ready to check in'
                : 'Paid - Ready to check in'
              : 'Ready to check in'}
          </Card>
        )
      ) : participant.checked_in ? (
        <Card>
          <ErrorIcon className="icon" />
          {deposit
            ? 'Checked in without deposit !!!'
            : 'Checked in without payment !!!'}
        </Card>
      ) : (
        <Card>
          <PriceIcon className="icon" />
          {deposit ? 'Deposit missing' : 'Payment missing'}
        </Card>
      )}
    </div>
  );
}
