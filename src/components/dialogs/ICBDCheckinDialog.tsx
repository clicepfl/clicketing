import { formatTime } from '@/actions/common-client';
import {
  getICBDInterviewsForParticipant,
  returnDeposit,
  updateICBDInterviewTimeslot,
} from '@/actions/icbd';
import {
  ICBDActivityInfo,
  ICBDInterviewStatus,
  ICBDTimeslot,
} from '@/actions/icbd-client';
import { useEffect, useState } from 'react';
import Card from '../Card';
import { CheckinBlock } from '../CheckinBlock';
import DropdownCard from '../DropdownCard';
import Split from '../Split';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import ClockIcon from '../icons/ClockIcon';
import ErrorIcon from '../icons/ErrorIcon';
import { DialogProps } from './CheckinDialog';

export function ICBDCheckinDialog({
  event,
  participant,
  close,
  updateParticipant,
  paymentOnlyDialog = false,
}: DialogProps) {
  const handleReturnDeposit = async () => {
    try {
      const newRes = await returnDeposit(participant.id);
      updateParticipant(newRes);
    } catch (err) {
      console.error('Failed to return deposit', err);
    }
  };

  const [interviews, setInterviews] = useState<ICBDInterviewStatus[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<
    Record<number, ICBDTimeslot | null>
  >({});

  useEffect(() => {
    if (!paymentOnlyDialog) return;
    let cancelled = false;
    (async () => {
      try {
        const acts =
          (await getICBDInterviewsForParticipant(participant.id, event.id)) ||
          [];
        if (cancelled) return;
        setInterviews(acts);

        const initialSelectedSlots = Object.fromEntries(
          (acts || []).map((act) => {
            const matched =
              (act.availableTimeslots || []).find(
                (ts) => ts.start_time === act.timeslot?.start_time
              ) ?? null;
            return [act.activity.id, matched ?? act.timeslot ?? null];
          })
        ) as Record<number, ICBDTimeslot | null>;

        setSelectedSlots(initialSelectedSlots);
      } catch (err) {
        console.error('Failed to load ICBD interviews', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentOnlyDialog, participant.id, event.id]);

  const handleSlotChange = (activityId: number, slot: ICBDTimeslot | null) =>
    setSelectedSlots((s) => ({ ...s, [activityId]: slot }));

  const handleSaveTimeslots = async () => {
    try {
      const updates = interviews
        .filter(
          (act) =>
            (selectedSlots[act.activity.id]?.start_time ?? null) !==
            (act.timeslot?.start_time ?? null)
        )
        .map((act) =>
          updateICBDInterviewTimeslot(
            participant.id,
            act.activity.id,
            selectedSlots[act.activity.id] ?? null
          )
        );

      await Promise.all(updates);

      const updatedActs =
        (await getICBDInterviewsForParticipant(participant.id, event.id)) || [];

      setInterviews(updatedActs);

      setSelectedSlots(
        Object.fromEntries(
          updatedActs.map((act) => {
            const matched =
              (act.availableTimeslots || []).find(
                (ts) =>
                  act.timeslot && ts.start_time === act.timeslot.start_time
              ) ?? null;
            return [act.activity.id, matched ?? act.timeslot ?? null];
          })
        ) as Record<number, ICBDTimeslot | null>
      );
    } catch (err) {
      console.error('Failed to save timeslots', err);
    }
  };

  const changesMap: Record<number, boolean> = interviews.reduce(
    (acc, act) => {
      acc[act.activity.id] =
        (selectedSlots[act.activity.id]?.start_time ?? null) !==
        (act.timeslot?.start_time ?? null);
      return acc;
    },
    {} as Record<number, boolean>
  );

  const hasActiveTimeslotChanges = Object.values(changesMap).some(Boolean);

  return (
    <>
      <Split>
        <b>{`${participant.first_name} ${participant.family_name}`}</b>
      </Split>

      <CheckinBlock
        participant={participant}
        onUpdateSuccess={updateParticipant}
        requiresPayment={true}
        paymentOnlyDialog={paymentOnlyDialog}
      />

      {/* Timeslot selection (only shown on payment dialog) */}
      {paymentOnlyDialog ? (
        interviews.length === 0 ? (
          <Card>No activities requiring timeslot selection</Card>
        ) : (
          <>
            {interviews.map((act: ICBDInterviewStatus) => {
              const activity: ICBDActivityInfo = act.activity;
              const timeslots: ICBDTimeslot[] = act.availableTimeslots || [];
              const activityChanged = changesMap[activity.id] ?? false;
              return (
                <Split key={activity.id}>
                  <Card>
                    <div>
                      <b>{activity.name}</b>
                    </div>
                  </Card>
                  {timeslots.length === 0 ? (
                    <Card Icon={ErrorIcon}>No timeslots available</Card>
                  ) : (
                    <DropdownCard
                      Icon={activityChanged ? ErrorIcon : ClockIcon}
                      placeholder="No timeslot selected"
                      options={[
                        { value: null, display: 'Release timeslot' },
                        ...timeslots.map((ts: ICBDTimeslot) => ({
                          value: ts,
                          display:
                            (ts.custom_name ? `(${ts.custom_name}) ` : '') +
                            `${formatTime(
                              ts.start_time
                            )} - ${formatTime(ts.end_time)} in ${ts.room}`,
                        })),
                      ]}
                      dropdownState={{
                        value: selectedSlots[activity.id] ?? null,
                        setValue: (slot) => handleSlotChange(activity.id, slot),
                      }}
                    />
                  )}
                </Split>
              );
            })}
            {participant.payment ? (
              <button onClick={handleSaveTimeslots}>
                {hasActiveTimeslotChanges ? (
                  <ErrorIcon className="icon" />
                ) : (
                  <CheckCircleIcon className="icon" />
                )}
                Save timeslots
              </button>
            ) : (
              <Card Icon={ErrorIcon}>Pay deposit to select timeslots</Card>
            )}
          </>
        )
      ) : null}

      {paymentOnlyDialog ? null : participant.retreived_deposit ? (
        <Card>
          <CheckCircleIcon className="icon" />
          Deposit already returned
        </Card>
      ) : participant.can_retreive_deposit ? (
        <button onClick={handleReturnDeposit}>Return deposit</button>
      ) : (
        <Card>Deposit cannot be returned</Card>
      )}
      <button onClick={close}>Close</button>
    </>
  );
}
