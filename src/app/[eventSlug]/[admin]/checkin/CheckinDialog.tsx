import { checkInRegistration } from '@/actions/common-server';
import { getTeamMembers } from '@/actions/hello-world';
import { returnDeposit } from '@/actions/icbd';
import Card from '@/components/Card';
import { CheckinBlock } from '@/components/CheckinBlock';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import Split from '@/components/Split';
import { Event, Registration } from '@/types/aliases';
import { useEffect, useState } from 'react';

export interface DialogProps {
  event: Event;
  participant: Registration;
  close: () => void;
  updateParticipant: (newRes: Registration) => void;
}

export function BasicCheckinDialog({
  event,
  close,
  participant,
  updateParticipant,
}: DialogProps) {
  return (
    <>
      <Split>
        <b>{`${participant.first_name} ${participant.family_name}`}</b>
      </Split>

      <CheckinBlock
        participant={participant}
        onUpdateSuccess={updateParticipant}
        requiresPayment={event.price > 0}
      />

      <button onClick={close}>Close</button>
    </>
  );
}

export function ICBDCheckinDialog({
  event,
  participant,
  close,
  updateParticipant,
}: DialogProps) {
  // API Call Return Deposit
  const handleReturnDeposit = async () => {
    const newRes = await returnDeposit(participant.id);
    updateParticipant(newRes);
  };

  return (
    <>
      <Card>{`${participant.first_name} ${participant.family_name}`}</Card>

      <CheckinBlock
        participant={participant}
        onUpdateSuccess={updateParticipant}
        requiresPayment={false}
      />
      {participant.retreived_deposit ? (
        <Card>
          <CheckCircleIcon className="icon" />
          Deposit already returned
        </Card>
      ) : participant.can_retreive_deposit ? (
        <button onClick={handleReturnDeposit}>Return deposit</button>
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
  updateParticipant,
}: DialogProps) {
  return (
    <>
      <Split>
        <b>{`${participant.first_name} ${participant.family_name}`}</b>
        <span>{event.meals[participant.meal].name} Menu</span>
      </Split>

      <CheckinBlock
        participant={participant}
        onUpdateSuccess={updateParticipant}
        requiresPayment={event.price > 0}
      />

      <button onClick={close}>Close</button>
    </>
  );
}

export function HWCheckinDialog({
  event,
  close,
  participant,
  updateParticipant,
}: DialogProps) {
  const [teamMembers, setTeamMembers] = useState<Registration[]>([]);

  useEffect(() => {
    getTeamMembers(participant.team, event.id).then((members) =>
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
            <CheckinBlock
              participant={member}
              onUpdateSuccess={updateParticipant}
              requiresPayment={event.price > 0}
              checkinButtonText={`Check-in ${member.first_name} ${member.family_name}`}
            />
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
                updateParticipant(newRes);
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
