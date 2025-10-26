'use client';

import { renderCheckinDialog } from '@/components/dialogs/CheckinDialog';
import ParticipantDisplay from '@/components/ParticipantDisplay';
import QRScannerSelector from '@/components/QRScannerSelector';
import { Event, Registration } from '@/types/aliases';
import { useCallback, useState } from 'react';

export function CheckIn({
  participants: initialParticipants,
  event,
}: {
  event: Event;
  participants: Registration[];
}) {
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
      <h1>Check-in</h1>
      <QRScannerSelector
        items={participants.map((p) => ({
          component: <ParticipantDisplay event={event} participant={p} />,
          searchValue: `${p.first_name} ${p.family_name} ${p.email}`,
          value: p.id,
        }))}
        onSelect={() => {}}
        dialog={(value, close) => {
          var participant = participants.find((p) => p.id == value);
          if (!participant) return <div>Participant not found</div>;
          return renderCheckinDialog(
            event,
            participant,
            updateParticipant,
            close
          );
        }}
      />
    </div>
  );
}
