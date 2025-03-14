import { checkInRegistration, markPayment } from '@/actions/common';
import { returnDeposit } from '@/actions/icbd';
import Card from '@/components/Card';
import DropdownCard from '@/components/DropdownCard';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import SplitText from '@/components/SplitText';
import { Event, Registration } from '@/types/aliases';
import { Dispatch, SetStateAction, useState } from 'react';

interface DialogDefaultProps {
  participant: Registration;
  close: () => void;
  setParticipants: Dispatch<SetStateAction<Registration[]>>;
}

export function ICBDCheckinDialog({
  participant,
  close,
  setParticipants,
}: DialogDefaultProps) {
  return (
    <>
      <Card>{`${participant.first_name} ${participant.family_name}`}</Card>

      {participant.checked_in ? (
        <Card>
          <CheckCircleIcon className="icon" />
          Already checked in
        </Card>
      ) : (
        <button
          onClick={async () => {
            const newRes = await checkInRegistration(participant.id);
            setParticipants((value) => [
              ...value.filter((p) => p.id != participant.id),
              newRes,
            ]);
          }}
        >
          Check-in
        </button>
      )}
      {participant.retreived_deposit ? (
        <Card>
          <CheckCircleIcon className="icon" />
          Deposit already returned
        </Card>
      ) : participant.can_retreive_deposit ? (
        <button
          onClick={async () => {
            const newRes = await returnDeposit(participant.id);
            setParticipants((value) => [
              ...value.filter((p) => p.id != participant.id),
              newRes,
            ]);
          }}
        >
          Return deposit
        </button>
      ) : (
        <Card>Deposit cannot be returned</Card>
      )}
      <button onClick={close}>Close</button>
    </>
  );
}

export function FDCheckinDialog({
  event,
  close,
  participant,
  setParticipants,
}: { event: Event } & DialogDefaultProps) {
  const [payment, setPayment] = useState(null);

  return (
    <>
      <Card>{`${participant.first_name} ${participant.family_name}`}</Card>

      <Card>
        {participant.payment === null ? (
          <SplitText
            snippets={['Not payed !', event.meals[participant.meal].name]}
          />
        ) : (
          event.meals[participant.meal].name
        )}
      </Card>

      {participant.payment !== null ? (
        participant.checked_in ? (
          <Card>
            <CheckCircleIcon className="icon" />
            Already checked in
          </Card>
        ) : (
          <button
            onClick={async () => {
              const newRes = await checkInRegistration(participant.id);
              setParticipants((value) => [
                ...value.filter((p) => p.id != participant.id),
                newRes,
              ]);
            }}
          >
            Check-in
          </button>
        )
      ) : (
        <>
          <DropdownCard
            Icon={'symbol'}
            placeholder={''}
            options={[
              { display: 'Cash', value: 'cash' },
              { display: 'Camipro', value: 'camipro' },
            ]}
            dropdownState={{
              value: payment,
              setValue: setPayment,
            }}
          />
          <button
            onClick={async () => {
              const newRes = await markPayment(participant.id, payment, false);
              setParticipants((value) => [
                ...value.filter((p) => p.id != participant.id),
                newRes,
              ]);
            }}
            disabled={payment === null}
          >
            Pay !
          </button>
        </>
      )}

      <button onClick={close}>Close</button>
    </>
  );
}
