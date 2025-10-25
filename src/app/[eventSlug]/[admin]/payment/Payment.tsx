'use client';
import { renderPaymentDialog } from '@/components/dialogs/CheckinDialog';
import ParticipantDisplay from '@/components/ParticipantDisplay';
import SearchSelector from '@/components/SearchSelector';
import { Registration } from '@/types/aliases';
import { useCallback, useState } from 'react';

export default function Payment({ event, participants: initialParticipants }) {
  const [participants, setParticipants] = useState(initialParticipants);
  const updateParticipant = useCallback(
    (newRes: Registration) => {
      setParticipants((currentParticipants) => [
        ...currentParticipants.filter((p) => p.id !== newRes.id),
        newRes,
      ]);
    },
    [setParticipants]
  );

  return (
    <div className="checkin">
      <h1>Payment</h1>
      <SearchSelector
        items={participants.map((p) => ({
          component: <ParticipantDisplay event={event} participant={p} />,
          searchValue: `${p.first_name} ${p.family_name} ${p.email}`,
          value: p.id,
        }))}
        onSelect={() => {}}
        dialog={(value, close) => {
          var participant = participants.find((p) => p.id == value);
          if (!participant) return <div>Participant not found</div>;
          return renderPaymentDialog(
            event,
            participant,
            updateParticipant,
            close
          );
        }}
      ></SearchSelector>
    </div>
  );
}
