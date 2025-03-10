'use client';

import { markAttendance } from '@/actions/icbd';
import Card from '@/components/Card';
import DropdownCard from '@/components/DropdownCard';
import ClockIcon from '@/components/icons/ClockIcon';
import TeamIcon from '@/components/icons/TeamIcon';
import QRScannerSelector from '@/components/QRScannerSelector';
import { getTranslation } from '@/locales';
import {
  ICBDActivity,
  ICBDActivityRegistration,
  Registration,
} from '@/types/aliases';
import { useState } from 'react';

function AttendanceDisplay(props: { email: string; attended: boolean }) {
  return (
    <p>
      {props.email}: {JSON.stringify(props.attended)}
    </p>
  );
}

export default function Attendance({
  activities,
  registrations: initialRegistrations,
}: {
  activities: ICBDActivity[];
  registrations: ICBDActivityRegistration[];
}) {
  const [activity, setSelectedActivity] = useState(null as string | null);
  const [timeslot, setSelectedTimeslot] = useState(null as string | null);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  console.log(registrations);

  return (
    <div className="form">
      <h1>Attendance</h1>
      <DropdownCard
        Icon={TeamIcon}
        placeholder={'Select an activity'}
        options={activities.map((a) => ({
          value: a.id.toString(),
          display: getTranslation(a, 'en').name,
        }))}
        dropdownState={{
          value: activity,
          setValue: setSelectedActivity,
        }}
      />
      {activity !== null ? (
        <>
          <DropdownCard
            Icon={ClockIcon}
            placeholder={'Select a timeslot'}
            options={(
              activities.find((a) => a.id.toString() == activity).timeslots as {
                start_time: string;
              }[]
            ).map((a) => ({
              value: a.start_time,
              display: a.start_time,
            }))}
            dropdownState={{
              value: timeslot,
              setValue: setSelectedTimeslot,
            }}
          />
          {timeslot !== null ? (
            <QRScannerSelector
              items={registrations
                .filter(
                  (r) => r.icbd_activity == activity && r.start === timeslot
                )
                .map((r) => ({
                  value: (r.registration as Registration).id,
                  searchValue: (r.registration as Registration).email,
                  component: (
                    <AttendanceDisplay
                      email={(r.registration as Registration).email}
                      attended={r.attended}
                    />
                  ),
                }))}
              onSelect={() => {}}
              dialog={function (value: string, close: () => void) {
                const r = registrations.find(
                  (r) => (r.registration as Registration).id.toString() == value
                );
                console.log(r);

                return (
                  <>
                    <AttendanceDisplay
                      email={(r.registration as Registration).email}
                      attended={r.attended}
                    />

                    {!r.attended ? (
                      <button
                        onClick={async () => {
                          await markAttendance(r.id.toString());
                          setRegistrations((v) => [
                            ...v.filter((v) => v.id != r.id),
                            { ...r, attended: true },
                          ]);
                        }}
                      >
                        Mark attended
                      </button>
                    ) : (
                      <Card>Already validated</Card>
                    )}
                    <button onClick={close}>Close</button>
                  </>
                );
              }}
            />
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
