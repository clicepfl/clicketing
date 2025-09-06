import { checkInRegistration, markPayment } from '@/actions/common';
import { getTeamMembers } from '@/actions/hello-world';
import { returnDeposit } from '@/actions/icbd';
import Card from '@/components/Card';
import DropdownCard from '@/components/DropdownCard';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import PriceIcon from '@/components/icons/PriceIcon';
import Split from '@/components/Split';
import { Event, Registration } from '@/types/aliases';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

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
  const [teamMembers, setTeamMembers] = useState<Registration[]>([]);

  useEffect(() => {
    getTeamMembers(participant.team, event.id.toString()).then((members) =>
      setTeamMembers(members)
    );
  }, [teamMembers]);

  return teamMembers.length === 0 ? (
    <>Loading team members...</>
  ) : (
    <>
      <b>{participant.team}</b>

      {teamMembers.length != 3 ? (
        <>
          <Card>
            <ErrorIcon className="icon" />
            Team {participant.team} has {teamMembers.length} members rather than
            3 !
          </Card>
        </>
      ) : null}

      {teamMembers.map((member) => (
        <>
          <Split>
            <span className="center-text half">
              <b>{`${member.first_name} ${member.family_name}`}</b>
            </span>
            {member.checked_in ? (
              <Card key={member.id}>
                <CheckCircleIcon className="icon" />
                Already checked in
              </Card>
            ) : (
              <button
                onClick={async () => {
                  const newRes = await checkInRegistration(member.id);
                  setParticipants((value) => [
                    ...value.filter((p) => p.id != member.id),
                    newRes,
                  ]);
                }}
                key={member.id}
              >
                Check-in {member.first_name} {member.family_name}
              </button>
            )}
          </Split>
        </>
      ))}

      {teamMembers.filter((member) => !member.checked_in).length === 0 ? (
        <Card>
          <CheckCircleIcon className="icon" />
          All team members checked in
        </Card>
      ) : (
        <button
          onClick={async () => {
            for (const member of teamMembers) {
              if (!member.checked_in) {
                const newRes = await checkInRegistration(member.id);
                setParticipants((value) => [
                  ...value.filter((p) => p.id != member.id),
                  newRes,
                ]);
              }
            }
          }}
        >
          Check-in all team
        </button>
      )}

      <button onClick={close}>Close</button>
    </>
  );
}
