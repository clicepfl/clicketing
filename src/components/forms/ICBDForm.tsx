'use client';

import {
  FormStates,
  IC_SECTIONS,
  ParticipantState,
  SPRING_YEARS,
  Season,
  emptyParticipantState,
  makeInfoItems,
  validateParticipant,
} from '@/actions/common-client';
import { sendRegistration } from '@/actions/common-server';
import {
  completeRegistration,
  sendICBDActivitiesRegistrations,
} from '@/actions/icbd';
import { Event } from '@/types/aliases';
import { ElementType, ReactNode, useState } from 'react';
import Card from '../Card';
import CheckboxCard from '../CheckboxCard';
import DropdownCard from '../DropdownCard';
import ErrorMessage from '../ErrorMessage';
import InfoLine from '../InfoLine';
import SplitText from '../SplitText';
import TextInputCard from '../TextInputCard';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import EmailIcon from '../icons/EmailIcon';
import ErrorIcon from '../icons/ErrorIcon';
import TeamIcon from '../icons/TeamIcon';
import UserIcon from '../icons/UserIcon';

type State = {
  formState: FormStates;
  participant: ParticipantState;
  consent: boolean;
  selectedTalks: boolean[];
  selectedDiscussions: boolean[];
  selectedInterviews: boolean[];
  cvCorrection: boolean;
  cvCorrectionConfirmed: boolean;
  errorMessage: string;
};

async function register({
  eventId,
  participant,
  activitiesIDs,
  noSlotActivitiesIDs,
}) {
  let registrationId = await sendRegistration({
    eventId,
    participant,
    comments: null,
  });

  await sendICBDActivitiesRegistrations({
    activitiesIDs,
    noSlotActivitiesIDs,
    registrationID: registrationId,
  });

  await completeRegistration(registrationId);
}

async function validateValues(s: State, eventId: number) {
  const error = validateParticipant(
    s.participant,
    eventId,
    Season.Spring,
    true
  );
  if (error) {
    return error;
  }

  if (!s.consent) {
    return 'Consent is required';
  }

  if (s.cvCorrection && !s.cvCorrectionConfirmed) {
    return 'You must be present at the CV presentation';
  }

  if (
    !s.selectedTalks.some((selected) => selected) &&
    !s.selectedDiscussions.some((selected) => selected) &&
    !s.selectedInterviews.some((selected) => selected) &&
    !s.cvCorrection
  ) {
    return 'No activities selected';
  }

  return null;
}

export default function ICBDForm({
  event,
  location,
  talks,
  discussions,
  interviews,
  cvCorrection,
}: {
  event: Event;
  location: string;
  talks: { title: string; time: string; id: number }[];
  discussions: { title: string; time: string; id: number }[];
  interviews: { title: string; time: string; id: number }[];
  cvCorrection: { title: string; time: string; id: number };
}) {
  // Info items
  const infoItems: [ElementType, ReactNode][] = makeInfoItems(
    event,
    location,
    true
  );

  // Define initial state
  const initialState: State = {
    formState: FormStates.Form,
    participant: emptyParticipantState,
    consent: false,
    selectedTalks: talks.map(() => false),
    selectedDiscussions: discussions.map(() => false),
    selectedInterviews: interviews.map(() => false),
    cvCorrection: false,
    cvCorrectionConfirmed: false,
    errorMessage: '',
  };

  const [state, setState] = useState(initialState);

  const setField = <K extends keyof State>(field: K, value: State[K]) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const setParticipantField = <K extends keyof ParticipantState>(
    field: K,
    value: ParticipantState[K]
  ) => {
    setState((prevState) => ({
      ...prevState,
      participant: {
        ...prevState.participant,
        [field]: value,
      },
    }));
  };

  return (
    <div className="form">
      <h1>ICBD Registration</h1>
      <InfoLine infoItems={infoItems}></InfoLine>

      {(() => {
        switch (state.formState) {
          case FormStates.Form:
            return (
              <Form
                s={state}
                setField={setField}
                setParticipantField={setParticipantField}
                talks={talks}
                discussions={discussions}
                interviews={interviews}
                cvCorrection={cvCorrection}
                eventId={event.id}
              />
            );
          case FormStates.Loading:
            return <Loading></Loading>;
          case FormStates.Confirmation:
            return (
              <Confirmation
                interviewSelected={
                  state.cvCorrection ||
                  state.selectedInterviews.some((selected) => selected)
                }
              />
            );
          case FormStates.Error:
            return <ErrorDisplay message={state.errorMessage}></ErrorDisplay>;
          default:
            return null;
        }
      })()}
    </div>
  );
}

function Form({
  s,
  setField,
  setParticipantField,
  talks,
  discussions,
  interviews,
  cvCorrection,
  eventId,
}: {
  s: State;
  setField: <K extends keyof State>(field: K, value: State[K]) => void;
  setParticipantField: <K extends keyof ParticipantState>(
    field: K,
    value: ParticipantState[K]
  ) => void;
  talks: { title: string; time: string; id: number }[];
  discussions: { title: string; time: string; id: number }[];
  interviews: { title: string; time: string; id: number }[];
  cvCorrection: { title: string; time: string; id: number };
  eventId: number;
}) {
  function changeSelection(
    index: number,
    newValue: boolean,
    oldValues: boolean[]
  ) {
    const newValues = [...oldValues];
    newValues[index] = newValue;
    return newValues;
  }

  return (
    <>
      <section>
        <TextInputCard
          Icon={UserIcon}
          placeholder="First Name"
          inputState={{
            value: s.participant.firstName,
            setValue: (value) => setParticipantField('firstName', value),
          }}
        />
        <TextInputCard
          Icon={UserIcon}
          placeholder="Last Name"
          inputState={{
            value: s.participant.lastName,
            setValue: (value) => setParticipantField('lastName', value),
          }}
        />
        <TextInputCard
          Icon={EmailIcon}
          placeholder="EPFL Email"
          inputState={{
            value: s.participant.email,
            setValue: (value) => setParticipantField('email', value),
          }}
        />

        <DropdownCard
          Icon={TeamIcon}
          placeholder="Section"
          options={IC_SECTIONS.map((v) => ({
            display: v,
            value: v,
          }))}
          dropdownState={{
            value: s.participant.section,
            setValue: (value) => setParticipantField('section', value),
          }}
        />

        <DropdownCard
          Icon={TeamIcon}
          placeholder="Year"
          options={SPRING_YEARS.map((v) => ({
            display: v,
            value: v,
          }))}
          dropdownState={{
            value: s.participant.year,
            setValue: (value) => setParticipantField('year', value),
          }}
        />

        <CheckboxCard
          checkboxState={{
            value: s.consent,
            setValue: (value) => setField('consent', value),
          }}
        >
          I consent to CLIC taking photographs of me at ICBD and using it for
          promotional purposes.
        </CheckboxCard>
      </section>

      <section>
        <h2>Talks</h2>

        {talks.map((talk, i) => (
          <CheckboxCard
            key={i}
            checkboxState={{
              value: s.selectedTalks[i],
              setValue: (value) => {
                setField(
                  'selectedTalks',
                  changeSelection(i, value, s.selectedTalks)
                );
              },
            }}
          >
            <SplitText snippets={[talk.title, talk.time]} />
          </CheckboxCard>
        ))}
      </section>

      <section>
        <h2>Discussions</h2>

        {discussions.map((discussion, i) => (
          <CheckboxCard
            key={i}
            checkboxState={{
              value: s.selectedDiscussions[i],
              setValue: (value) => {
                setField(
                  'selectedDiscussions',
                  changeSelection(i, value, s.selectedDiscussions)
                );
              },
            }}
          >
            <SplitText snippets={[discussion.title, discussion.time]} />
          </CheckboxCard>
        ))}
      </section>

      <section>
        <h2>CV Correction</h2>

        <p>
          Your slot for the CV correction will only be assigned to you when you
          come to pay your deposit of 10CHF at the CLIC Office in INM 177, if
          there are still slots available.
        </p>

        <CheckboxCard
          checkboxState={{
            value: s.cvCorrection,
            setValue: (value) => {
              setField('cvCorrection', value);
            },
          }}
        >
          I want to participate in a CV correction
        </CheckboxCard>
        {s.cvCorrection ? (
          <CheckboxCard
            checkboxState={{
              value: s.cvCorrectionConfirmed,
              setValue: (value) => {
                setField('cvCorrectionConfirmed', value);
              },
            }}
          >
            I attest I will assist the remote presentation on the Friday 7th
            from 12:15 to 14:00
          </CheckboxCard>
        ) : (
          <></>
        )}
      </section>

      <section>
        <h2>Interviews</h2>

        <p>
          Your slot for any interview will only be assigned to you when you come
          to pay your deposit of 10CHF at the CLIC Office in INM 177, if there
          are still slots available.
        </p>

        {interviews.map((interview, i) => (
          <CheckboxCard
            key={i}
            checkboxState={{
              value: s.selectedInterviews[i],
              setValue: (value) => {
                setField(
                  'selectedInterviews',
                  changeSelection(i, value, s.selectedInterviews)
                );
              },
            }}
          >
            <SplitText snippets={[interview.title]} />
          </CheckboxCard>
        ))}
      </section>

      <button
        onClick={async () => {
          const error = await validateValues(s, eventId);

          setField('errorMessage', error);

          if (!error) {
            let talksIds = talks
              .filter((talk, i) => s.selectedTalks[i])
              .map((talk) => talk.id);
            let discussionsIds = discussions
              .filter((discussion, i) => s.selectedDiscussions[i])
              .map((discussion) => discussion.id);

            let interviewsIds = interviews
              .filter((interview, i) => s.selectedInterviews[i])
              .map((interview) => interview.id);

            setField('formState', FormStates.Loading);

            try {
              await register({
                eventId,
                participant: s.participant,
                activitiesIDs: [...talksIds, ...discussionsIds],
                noSlotActivitiesIDs: [
                  ...interviewsIds,
                  ...(s.cvCorrection ? [cvCorrection.id] : []),
                ],
              });
              setField('formState', FormStates.Confirmation);
            } catch (error) {
              setField('errorMessage', error.message);
              setField('formState', FormStates.Error);
            }
          }
        }}
      >
        Confirm Registration
      </button>

      <ErrorMessage message={s.errorMessage}></ErrorMessage>
    </>
  );
}

function Loading({}) {
  return <p>Loading...</p>;
}

function Confirmation({ interviewSelected }: { interviewSelected: boolean }) {
  return (
    <>
      <Card Icon={CheckCircleIcon}>
        <p>Your registration to ICBD is successful !</p>
      </Card>

      <p>
        Check your email for confirmation, and don't forget to pay your deposit
        at the CLIC office in INM 177. We are available between 10:00 and 17:00
        on weekdays.
      </p>
      <p>This deposit will be refunded to you when you attend the event.</p>
      {interviewSelected && (
        <Card Icon={ErrorIcon}>
          <p>
            You have registered for a <b>Mock Interview</b>,{' '}
            <b>Speed Networking</b> or <b>CV Correction</b> activity. Your slot
            for this activity will only be confirmed after you pay your deposit,
            if slots are still available.
          </p>
        </Card>
      )}
    </>
  );
}
