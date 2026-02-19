'use client';

import { markAttendance } from '@/actions/icbd';
import Card from '@/components/Card';
import DropdownCard from '@/components/DropdownCard';
import QRScannerSelector from '@/components/QRScannerSelector';
import Split from '@/components/Split';
import CheckMarkIcon from '@/components/icons/CheckMarkIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import QuestionMarkIcon from '@/components/icons/QuestionMarkIcon';
import TeamIcon from '@/components/icons/TeamIcon';
import { getTranslation } from '@/locales';
import {
  ICBDActivity,
  ICBDActivityRegistration,
  Registration,
} from '@/types/aliases';
import { useState } from 'react';

function AttendanceDisplay(props: {
  email: string;
  first_name?: string;
  last_name?: string;
  attended: boolean;
}) {
  return (
    <div className="clickable">
      <Split>
        <div className="vertical-stack">
          <b>
            {props.first_name} {props.last_name}
          </b>
          <span>{props.email}</span>
        </div>
        {props.attended ? (
          <CheckMarkIcon className="icon" />
        ) : (
          <QuestionMarkIcon className="icon" />
        )}
      </Split>
    </div>
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
            ).map((a) => {
              const [hours, minutes, seconds] = a.start_time.split(':');
              return {
                value: a.start_time,
                display: `${hours}:${minutes}`,
              };
            })}
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
                      first_name={(r.registration as Registration).first_name}
                      last_name={(r.registration as Registration).family_name}
                      attended={r.attended}
                    />
                  ),
                }))}
              onSelect={() => {}}
              dialog={(value, close) => {
                const r = registrations.find(
                  (r) =>
                    (r.registration as Registration).id.toString() == value &&
                    r.icbd_activity == activity
                );

                return (
                  <>
                    <AttendanceDisplay
                      email={(r.registration as Registration).email}
                      first_name={(r.registration as Registration).first_name}
                      last_name={(r.registration as Registration).family_name}
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
