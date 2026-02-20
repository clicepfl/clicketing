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
import Markdown from 'react-markdown';
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
  errorMessage: string;
};

async function register({
  eventId,
  participant,
  activitiesIDs,
  noSlotActivitiesIDs,
}: {
  eventId: number;
  participant: ParticipantState;
  activitiesIDs: number[];
  noSlotActivitiesIDs: number[];
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

  // noSlotActivities are interviews (payment required)
  await completeRegistration(registrationId, noSlotActivitiesIDs.length != 0);
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

  if (
    !s.selectedTalks.some((selected) => selected) &&
    !s.selectedDiscussions.some((selected) => selected) &&
    !s.selectedInterviews.some((selected) => selected)
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
}: {
  event: Event;
  location: string;
  talks: { title: string; time: string; id: number }[];
  discussions: { title: string; time: string; id: number }[];
  interviews: { title: string; time: string; id: number }[];
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
                eventId={event.id}
                event={event}
              />
            );
          case FormStates.Loading:
            return <Loading></Loading>;
          case FormStates.Confirmation:
            return (
              <Confirmation
                event={event}
                interviewSelected={state.selectedInterviews.some(
                  (selected) => selected
                )}
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
  eventId,
  event,
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
  eventId: number;
  event: Event;
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
        <Markdown>{event.intro_text}</Markdown>
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
                noSlotActivitiesIDs: [...interviewsIds],
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

function Confirmation({
  event,
  interviewSelected,
}: {
  event: Event;
  interviewSelected: boolean;
}) {
  return (
    <>
      <Card Icon={CheckCircleIcon}>
        <p>Your registration to ICBD is successful !</p>
      </Card>
      <Markdown>{event.confirmation_text}</Markdown>
      {interviewSelected && (
        <Card Icon={ErrorIcon}>
          <p>
            You have registered for a <b>Mock Interview</b> or{' '}
            <b>Speed Networking</b> activity. Your slot for this activity will
            only be confirmed after you pay your deposit, if slots are still
            available.
          </p>
        </Card>
      )}
    </>
  );
}
