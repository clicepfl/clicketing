'use client';
import {
  AUTUMN_YEARS,
  FormStates,
  ParticipantState,
  SECTIONS,
  Season,
  emptyParticipantState,
  validateParticipant,
} from '@/actions/common-client';
import { sendRegistration } from '@/actions/common-server';
import { teamAlreadyUsed } from '@/actions/hello-world';
import { ElementType, ReactNode, useState } from 'react';
import Card from '../Card';
import CheckboxCard from '../CheckboxCard';
import DropdownCard from '../DropdownCard';
import ErrorMessage from '../ErrorMessage';
import InfoLine from '../InfoLine';
import LargeTextInputCard from '../LargeTextInputCard';
import TextInputCard from '../TextInputCard';
import CalendarIcon from '../icons/CalendarIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import EmailIcon from '../icons/EmailIcon';
import MapPinIcon from '../icons/MapPinIcon';
import PencilIcon from '../icons/PencilIcon';
import PriceIcon from '../icons/PriceIcon';
import TeamIcon from '../icons/TeamIcon';
import UserIcon from '../icons/UserIcon';

type State = {
  formState: FormStates;
  member1: ParticipantState;
  member2: ParticipantState;
  member3: ParticipantState;
  team: string;
  consent: boolean;
  errorMessage: string;
  comments: string;
};

async function validateValues(s: State, eventId: number) {
  let members = [s.member1, s.member2, s.member3];

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const error = await validateParticipant(member, eventId, Season.Autumn);
    if (error) {
      return `Member ${i + 1}: ${error}`;
    }
  }

  const emails = members.map((m) => m.email.toLowerCase());
  const uniqueEmails = new Set(emails);
  if (uniqueEmails.size !== emails.length) {
    return 'Team members must have different emails';
  }

  if (!s.team || s.team.length === 0) {
    return 'Team name is required';
  }

  if (await teamAlreadyUsed(s.team, eventId)) {
    return 'Team name is already used';
  }

  if (!s.consent) {
    return 'Consent is required';
  }

  return null;
}

export default function HelloWorldForm({
  eventId,
  date,
  location,
  deposit,
}: {
  eventId: number;
  date: string;
  location: string;
  deposit: string;
}) {
  // Info items
  const infoItems: [ElementType, ReactNode][] = [
    [CalendarIcon, date],
    [MapPinIcon, location],
    [PriceIcon, deposit],
  ];

  // Define initial state
  const initialState: State = {
    formState: FormStates.Form,
    member1: emptyParticipantState,
    member2: emptyParticipantState,
    member3: emptyParticipantState,
    team: '',
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

  const setMemberField = <K extends keyof ParticipantState>(
    memberNumber: 1 | 2 | 3,
    field: K,
    value: ParticipantState[K]
  ) => {
    let memberKey: keyof State = `member${memberNumber}`;
    const member = state[memberKey];
    const newMember = { ...member, [field]: value };
    setField(memberKey, newMember);
  };

  return (
    <div className="form">
      <h1>Hello World</h1>
      <InfoLine infoItems={infoItems}></InfoLine>

      {(() => {
        switch (state.formState) {
          case FormStates.Form:
            return (
              <Form
                s={state}
                setField={setField}
                setMemberField={setMemberField}
                eventId={eventId}
              />
            );
          case FormStates.Loading:
            return <Loading></Loading>;
          case FormStates.Confirmation:
            return <Confirmation />;
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
  setMemberField,
  eventId,
}: {
  s: State;
  setField: <K extends keyof State>(field: K, value: State[K]) => void;
  setMemberField: <K extends keyof ParticipantState>(
    memberNumber: 1 | 2 | 3,
    field: K,
    value: ParticipantState[K]
  ) => void;
  eventId: number;
}) {
  return (
    <>
      <section>
        <p className="spaced-p">
          To register for Hello World, you need to have formed a team of 3.
          <br />
          If you do not yet have a team, you can look for one on the{' '}
          <a href="https://t.me/+kwrmi0cIc75jNjM0">Hello World Group Finder</a>.
        </p>
        {[1, 2, 3].map((i: 1 | 2 | 3) => (
          <>
            <h2>Team Member {i}</h2>
            <TextInputCard
              Icon={UserIcon}
              placeholder="First Name"
              inputState={{
                value: s[`member${i}`].firstName,
                setValue: (value) => setMemberField(i, 'firstName', value),
              }}
            />
            <TextInputCard
              Icon={UserIcon}
              placeholder="Last Name"
              inputState={{
                value: s[`member${i}`].lastName,
                setValue: (value) => setMemberField(i, 'lastName', value),
              }}
            />
            <TextInputCard
              Icon={EmailIcon}
              placeholder="EPFL Email"
              inputState={{
                value: s[`member${i}`].email,
                setValue: (value) => setMemberField(i, 'email', value),
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
                value: s[`member${i}`].section,
                setValue: (value) => setMemberField(i, 'section', value),
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
                value: s[`member${i}`].year,
                setValue: (value) => setMemberField(i, 'year', value),
              }}
            />
          </>
        ))}

        <div className="spacer"></div>

        <TextInputCard
          Icon={TeamIcon}
          placeholder="Team Name"
          inputState={{
            value: s.team,
            setValue: (value) => setField('team', value),
          }}
        />

        <CheckboxCard
          checkboxState={{
            value: s.consent,
            setValue: (value) => setField('consent', value),
          }}
        >
          All three team members consent to CLIC taking photographs of them at
          Hello World and using them for promotional purposes.
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
          const error = await validateValues(s, eventId);

          if (error) {
            setField('errorMessage', error);
            return;
          }

          setField('formState', FormStates.Loading);

          try {
            for (let i = 1; i <= 3; i++) {
              const member = s[`member${i}`];
              await sendRegistration({
                eventId,
                participant: member,
                team: s.team,
                comments: s.comments,
              });
            }
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

function Confirmation() {
  return (
    <>
      <Card Icon={CheckCircleIcon}>
        <p>Your registration to Hello World is successful !</p>
      </Card>
      <p>Check your email for confirmation, and see you soon !</p>
    </>
  );
}
