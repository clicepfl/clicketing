'use client';

import Card from '@/components/Card';
import QRScannerSelector from '@/components/QRScannerSelector';
import SplitText from '@/components/SplitText';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import PriceIcon from '@/components/icons/PriceIcon';
import TicketIcon from '@/components/icons/TicketIcon';
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

function ParticipantDisplay({
  event,
  participant,
}: {
  event: Event;
  participant: Registration;
}) {
  switch (event.type) {
    case 'icbd':
      return <ICBDParticipantDisplay participant={participant} />;
    case 'faculty_dinner':
      return <FDParticipantDisplay participant={participant} />;
    default:
      break;
  }
}

function ICBDParticipantDisplay({
  participant,
}: {
  participant: Registration;
}) {
  return (
    <div className="participant-display">
      <SplitText
        snippets={[
          `${participant.first_name} ${participant.family_name}`,
          participant.email,
        ]}
      />

      {participant.payment !== null ? (
        participant.checked_in ? (
          <Card>
            <CheckCircleIcon className="icon" />
            Checked in
          </Card>
        ) : (
          <Card>
            <TicketIcon className="icon" />
            Deposit made, not checked in
          </Card>
        )
      ) : participant.checked_in ? (
        <Card>
          <ErrorIcon className="icon" />
          Checked in without deposit !!!
        </Card>
      ) : (
        <Card>
          <PriceIcon className="icon" />
          Deposit missing !
        </Card>
      )}
    </div>
  );
}

function FDParticipantDisplay({ participant }: { participant: Registration }) {
  return (
    <div className="participant-display">
      <SplitText
        snippets={[
          `${participant.first_name} ${participant.family_name}`,
          participant.email,
        ]}
      />
    </div>
  );
}
