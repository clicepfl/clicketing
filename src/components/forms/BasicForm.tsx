'use client';
import {
  AUTUMN_YEARS,
  FormStates,
  ParticipantState,
  SECTIONS,
  Season,
  emptyParticipantState,
  makeInfoItems,
  validateParticipant,
} from '@/actions/common-client';
import { sendRegistration } from '@/actions/common-server';
import { Event } from '@/types/aliases';
import { ElementType, ReactNode, useState } from 'react';
import Card from '../Card';
import CheckboxCard from '../CheckboxCard';
import DropdownCard from '../DropdownCard';
import ErrorMessage from '../ErrorMessage';
import FancyMarkdown from '../FancyMarkdown';
import InfoLine from '../InfoLine';
import LargeTextInputCard from '../LargeTextInputCard';
import TextInputCard from '../TextInputCard';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import EmailIcon from '../icons/EmailIcon';
import PencilIcon from '../icons/PencilIcon';
import TeamIcon from '../icons/TeamIcon';
import UserIcon from '../icons/UserIcon';

type State = {
  formState: FormStates;
  participant: ParticipantState;
  consent: boolean;
  errorMessage: string;
  comments: string;
};

async function validateValues(s: State, eventId: number) {
  const error = await validateParticipant(
    s.participant,
    eventId,
    Season.Autumn
  );
  if (error) {
    return error;
  }

  if (!s.consent) {
    return 'Consent is required';
  }

  return null;
}

export default function BasicForm({
  event,
  location,
}: {
  event: Event;
  location: string;
}) {
  // Info items
  const infoItems: [ElementType, ReactNode][] = makeInfoItems(event, location);

  // Define initial state
  const initialState: State = {
    formState: FormStates.Form,
    participant: emptyParticipantState,
    consent: false,
    errorMessage: '',
    comments: '',
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
      <h1>{event.name}</h1>
      <InfoLine infoItems={infoItems}></InfoLine>

      {(() => {
        switch (state.formState) {
          case FormStates.Form:
            return (
              <Form
                s={state}
                setField={setField}
                setParticipantField={setParticipantField}
                event={event}
              />
            );
          case FormStates.Loading:
            return <Loading></Loading>;
          case FormStates.Confirmation:
            return <Confirmation event={event} />;
          case FormStates.Error:
            return <ErrorDisplay message={state.errorMessage} />;
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
  event,
}: {
  s: State;
  setField: <K extends keyof State>(field: K, value: State[K]) => void;
  setParticipantField: <K extends keyof ParticipantState>(
    field: K,
    value: ParticipantState[K]
  ) => void;
  event: Event;
}) {
  return (
    <>
      <section>
        <FancyMarkdown>
          {'**Subsonic** is back 🎧 \n\n' +
            "Grab a headset, pick a vibe and lose yourself to the sound. You'll find 3 stages all playing at the same time : " +
            'switch channels directly on your headphone and choose between Techno, ' +
            'Commercial and House music!\n\n' +
            'Register below, then pay ' +
            'at the INM 177 Clic office. Our ' +
            'opening times: 3rd-13th November (not on the weekend) from 11am to ' +
            '2pm.\n\n Looking forward to vibing with you 💙💛❤️'}
        </FancyMarkdown>

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
          options={SECTIONS.map((v) => ({
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
          options={AUTUMN_YEARS.map((v) => ({
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
          I consent to CLIC taking photographs of me at {event.name} and using
          them for promotional purposes.
        </CheckboxCard>

        <LargeTextInputCard
          Icon={PencilIcon}
          placeholder="Additional Comments"
          inputState={{
            value: s.comments,
            setValue: (value) => setField('comments', value),
          }}
          rows={2}
        />
      </section>

      <button
        onClick={async () => {
          const error = await validateValues(s, event.id);

          if (error) {
            setField('errorMessage', error);
            return;
          }

          setField('formState', FormStates.Loading);

          try {
            await sendRegistration({
              eventId: event.id,
              participant: s.participant,
              comments: s.comments,
            });
            setField('formState', FormStates.Confirmation);
          } catch (error) {
            setField('errorMessage', error.message);
            setField('formState', FormStates.Error);
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

function Confirmation({ event }: { event: Event }) {
  return (
    <>
      <Card Icon={CheckCircleIcon}>
        <p>Your registration to {event.name} is successful !</p>
      </Card>
      <FancyMarkdown>
        {'⚠️ Your spot is only guaranteed after payment. Tickets go fast, so pay ' +
          'quickly to secure yours. \n\n Check your emails for confirmation and see ' +
          'you soon !'}
      </FancyMarkdown>
    </>
  );
}
