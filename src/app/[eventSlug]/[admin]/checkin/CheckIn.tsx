'use client';

import ParticipantDisplay from '@/components/ParticipantDisplay';
import QRScannerSelector from '@/components/QRScannerSelector';
import { Event, Registration } from '@/types/aliases';
import { useState } from 'react';
import { FDCheckinDialog, ICBDCheckinDialog } from './CheckinDialog';

export function CheckIn({
  participants: initialParticipants,
  event,
}: {
  event: Event;
  participants: Registration[];
}) {
  const [participants, setParticipants] = useState(initialParticipants);

  return (
    <div className="checkin">
      <QRScannerSelector
        items={participants.map((p) => ({
          component: <ParticipantDisplay event={event} participant={p} />,
          searchValue: `${p.first_name} ${p.family_name} ${p.email}`,
          value: p.id,
        }))}
        onSelect={() => {}}
        dialog={(value, close) => {
          var participant = participants.find((p) => p.id == value);
          switch (event.type) {
            case 'icbd':
              return (
                <ICBDCheckinDialog
                  participant={participant}
                  close={close}
                  setParticipants={setParticipants}
                />
              );
            case 'faculty_dinner':
              return (
                <FDCheckinDialog
                  event={event}
                  close={close}
                  participant={participant}
                  setParticipants={setParticipants}
                />
              );
            default:
              return <></>;
          }
        }}
      />
    </div>
  );
}
