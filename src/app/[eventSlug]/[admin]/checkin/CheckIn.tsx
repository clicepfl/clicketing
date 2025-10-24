'use client';

import ParticipantDisplay from '@/components/ParticipantDisplay';
import QRScannerSelector from '@/components/QRScannerSelector';
import { Event, Registration } from '@/types/aliases';
import { useCallback, useState } from 'react';
import {
  BasicCheckinDialog,
  DialogProps,
  FDCheckinDialog,
  HWCheckinDialog,
  ICBDCheckinDialog,
} from './CheckinDialog';

const DialogComponentMap = {
  icbd: ICBDCheckinDialog,
  faculty_dinner: FDCheckinDialog,
  hello_world: HWCheckinDialog,
  default: BasicCheckinDialog,
};

function renderCheckinDialog(
  event: Event,
  participant: Registration,
  updateParticipant: (newRes: Registration) => void,
  close: () => void
) {
  const Component =
    DialogComponentMap[event.type] || DialogComponentMap.default;
  const commonProps: DialogProps = {
    event,
    close,
    participant,
    updateParticipant,
  };
  return <Component {...commonProps} />;
}

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
