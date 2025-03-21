'use client';
import ParticipantDisplay from '@/components/ParticipantDisplay';
import SearchSelector from '@/components/SearchSelector';
import { useState } from 'react';
import { PaymentDialog } from './PaymentDialog';

export default function Payment({ event, participants: initialParticipants }) {
  const [participants, setParticipants] = useState(initialParticipants);
  return (
    <div className="form">
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
          return (
            <PaymentDialog
              event={event}
              participant={participant}
              close={close}
              setParticipants={setParticipants}
            ></PaymentDialog>
          );
        }}
      ></SearchSelector>
    </div>
  );
}
