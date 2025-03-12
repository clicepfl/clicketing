'use client';

import {
  checkInRegistration,
  getRegistration,
  returnDeposit,
} from '@/actions/icbd';
import Card from '@/components/Card';
import { ParticipantInfos } from '@/components/Dialog';
import QRScannerSelector from '@/components/QRScannerSelector';
import SplitText from '@/components/SplitText';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import PriceIcon from '@/components/icons/PriceIcon';
import TicketIcon from '@/components/icons/TicketIcon';
import { Registration } from '@/types/aliases';
import { useState } from 'react';

export function mapRegistration(r: Registration): ParticipantInfos {
  return {
    uid: r.id,
    firstName: r.first_name,
    lastName: r.family_name,
    email: r.email,
    checkedIn: r.checked_in,
    depositMade: r.payment != null,
    depositCanBeReturned: r.can_retreive_deposit,
    depositReturned: r.retreived_deposit,
  };
}

export function CheckIn({
  participants: initialParticipants,
}: {
  participants: ParticipantInfos[];
}) {
  const [participants, setParticipants] = useState(initialParticipants);

  return (
    <div className="checkin">
      <QRScannerSelector
        items={participants.map((p) => ({
          component: <ParticipantDisplay participant={p} />,
          searchValue: `${p.firstName} ${p.lastName} ${p.email}`,
          value: p.uid,
        }))}
        onSelect={(uid) => {
          getRegistration(uid).then((newRes) =>
            setParticipants((value) => [
              ...value.filter((p) => p.uid != uid),
              mapRegistration(newRes),
            ])
          );
        }}
        dialog={function (value: string, close: () => void) {
          var participant = participants.find((p) => p.uid == value);

          return (
            <>
              <Card>{`${participant.firstName} ${participant.lastName}`}</Card>

              {participant.checkedIn ? (
                <Card>
                  <CheckCircleIcon className="icon" />
                  Already checked in
                </Card>
              ) : (
                <button
                  onClick={async () => {
                    const newRes = await checkInRegistration(participant.uid);
                    setParticipants((value) => [
                      ...value.filter((p) => p.uid != participant.uid),
                      mapRegistration(newRes),
                    ]);
                  }}
                >
                  Check-in
                </button>
              )}
              {participant.depositReturned ? (
                <Card>
                  <CheckCircleIcon className="icon" />
                  Deposit already returned
                </Card>
              ) : participant.depositCanBeReturned ? (
                <button
                  onClick={async () => {
                    const newRes = await returnDeposit(participant.uid);
                    setParticipants((value) => [
                      ...value.filter((p) => p.uid != participant.uid),
                      mapRegistration(newRes),
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
        }}
      />
    </div>
  );
}

function ParticipantDisplay({
  participant,
}: {
  participant: ParticipantInfos;
}) {
  return (
    <div className="participant-display">
      <SplitText
        snippets={[
          `${participant.firstName} ${participant.lastName}`,
          participant.email,
        ]}
      />

      {participant.depositMade ? (
        participant.checkedIn ? (
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
      ) : participant.checkedIn ? (
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
