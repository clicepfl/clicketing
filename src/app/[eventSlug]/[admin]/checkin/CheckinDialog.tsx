import { checkInRegistration, markPayment } from '@/actions/common';
import { returnDeposit } from '@/actions/icbd';
import Card from '@/components/Card';
import DropdownCard from '@/components/DropdownCard';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import PriceIcon from '@/components/icons/PriceIcon';
import Split from '@/components/Split';
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

enum PaymentMethods {
  Cash = 'cash',
  Camipro = 'camipro',
  BankTransfer = 'bank_transfer',
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
      <Split>
        <b>{`${participant.first_name} ${participant.family_name}`}</b>
        <span>{event.meals[participant.meal].name} Menu</span>
      </Split>

      {participant.payment !== null ? (
        participant.checked_in ? (
          <Card>
            <CheckCircleIcon className="icon" />
            Already checked in
          </Card>
        ) : (
          <>
            <Card>
              <CheckCircleIcon className="icon" />
              Already paid by {participant.payment.split('_').join(' ')}
            </Card>
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
          </>
        )
      ) : (
        <>
          <Card>Payment has not been made</Card>
          <DropdownCard
            Icon={PriceIcon}
            placeholder={'Payment method'}
            options={Object.values(PaymentMethods).map((v) => ({
              display: v
                .split('_')
                .join(' ')
                .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()),
              value: v,
            }))}
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
            Save Payment
          </button>
        </>
      )}

      <button onClick={close}>Close</button>
    </>
  );
}

export function HWCheckinDialog({
  event,
  close,
  participant,
  setParticipants,
}: { event: Event } & DialogDefaultProps) {
  const [payment, setPayment] = useState(null);

  return (
    <>
      <Split>
        <b>{`${participant.first_name} ${participant.family_name}`}</b>
        <span>{participant.team}</span>
      </Split>

      {participant.checked_in ? (
        <Card>
          <CheckCircleIcon className="icon" />
          Already checked in
        </Card>
      ) : (
        <>
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
        </>
      )}

      <button onClick={close}>Close</button>
    </>
  );
}
