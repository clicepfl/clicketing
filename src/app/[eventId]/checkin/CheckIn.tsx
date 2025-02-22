'use client';

import {
  checkinRegistration as checkInRegistration,
  getRegistration,
} from '@/actions/icbd';
import Card from '@/components/Card';
import {
  Dialog,
  DialogType,
  DialogValues,
  ParticipantInfos,
} from '@/components/Dialog';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import PriceIcon from '@/components/icons/PriceIcon';
import TicketIcon from '@/components/icons/TicketIcon';
import UserIcon from '@/components/icons/UserIcon';
import QrCodeScanner from '@/components/QrCodeScanner';
import SplitText from '@/components/SplitText';
import TextInputCard from '@/components/TextInputCard';
import { QrcodeSuccessCallback } from 'html5-qrcode';
import { useEffect, useState } from 'react';

async function checkIn(participant: ParticipantInfos, setDialogValues) {
  if (!participant.checkedIn) {
    await checkInRegistration(participant.uid);
  }

  const status = participant.checkedIn
    ? { status: DialogType.WARNING, warning: 'Already checked in' }
    : { status: DialogType.SUCCESS };

  setDialogValues((oldValues) => {
    return oldValues === null
      ? ({
          ...status,
          ...participant,
        } as DialogValues)
      : oldValues;
  });
}

export function CheckIn({
  participants,
}: {
  participants: ParticipantInfos[];
}) {
  const [dialogValues, setDialogValues] = useState(null as DialogValues | null);
  const [filter, setFilter] = useState(null as string | null);
  const [filteredParticipants, setFilteredParticipants] = useState(
    [] as ParticipantInfos[]
  );

  useEffect(() => {
    if (filter === null || filter.length < 5) {
      setFilteredParticipants([]);
      return;
    }

    setFilteredParticipants(
      participants.filter(
        (p) =>
          p.email.toLowerCase().includes(filter.toLowerCase()) ||
          p.firstName.toLowerCase().includes(filter.toLowerCase()) ||
          p.lastName.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [filter, participants]);

  const onScanSuccess: QrcodeSuccessCallback = async (
    decodedText,
    decodedResult
  ) => {
    console.log(`${decodedText}, ${decodedResult}`);
    if (dialogValues === null) {
      const r = await getRegistration(decodedText);
      if (r == null) {
        setDialogValues({
          status: DialogType.ERROR,
          error: 'Registration not found',
        });
        return;
      }
      const participant = {
        uid: r.id,
        firstName: r.first_name,
        lastName: r.family_name,
        email: r.email,
        checkedIn: r.checked_in,
        depositMade: r.payment != null,
      };
      await checkIn(participant, setDialogValues);
    }
  };

  return (
    <div className="checkin">
      <QrCodeScanner
        qrCodeSuccessCallback={onScanSuccess}
        fps={10}
        qrbox={{ width: 250, height: 250 }}
      />
      <Dialog values={dialogValues} setValues={setDialogValues} />
      <div className="search">
        <TextInputCard
          Icon={UserIcon}
          placeholder="Search"
          inputState={{ value: filter, setValue: setFilter }}
        ></TextInputCard>
        <div className="search-results">
          {filteredParticipants.map((p) => (
            <ParticipantDisplay
              participant={p}
              key={p.uid}
              setDialogValues={setDialogValues}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ParticipantDisplay({
  participant,
  setDialogValues,
}: {
  participant: ParticipantInfos;
  setDialogValues: (values: DialogValues | null) => void;
}) {
  return (
    <div
      className="participant-display"
      onClick={async () => await checkIn(participant, setDialogValues)}
    >
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
