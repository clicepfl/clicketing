'use client';
import {
  FormStates,
  ParticipantState,
  SECTIONS,
  SPRING_YEARS,
  Season,
  emptyParticipantState,
  makeInfoItems,
  validateParticipant,
} from '@/actions/common-client';
import { sendRegistration } from '@/actions/common-server';
import { completeOrder, sendPullsOrders } from '@/actions/pulls';
import { Event, Pulls } from '@/types/aliases';
import { ElementType, ReactNode, useState } from 'react';
import Markdown from 'react-markdown';
import Card from '../Card';
import DropdownCard from '../DropdownCard';
import ErrorMessage from '../ErrorMessage';
import InfoLine from '../InfoLine';
import LargeTextInputCard from '../LargeTextInputCard';
import TextInputCard from '../TextInputCard';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import ColorPickerIcon from '../icons/ColorPickerIcon';
import EmailIcon from '../icons/EmailIcon';
import PencilIcon from '../icons/PencilIcon';
import PlusIcon from '../icons/PlusIcon';
import SizeIcon from '../icons/SizeIcon';
import TeamIcon from '../icons/TeamIcon';
import TrashIcon from '../icons/TrashIcon';
import UserIcon from '../icons/UserIcon';

type OrderedPull = {
  color?: number;
  size: string;
};

type State = {
  formState: FormStates;
  participant: ParticipantState;
  errorMessage: string;
  comments: string;
  pulls: OrderedPull[];
};

async function register({ eventId, participant, comments, pulls }) {
  let orderID = await sendRegistration({
    eventId,
    participant,
    comments,
  });

  await sendPullsOrders({ orderID, pulls });

  await completeOrder({ orderID, orderCount: pulls.length });
}

async function validateValues(s: State, eventId: number) {
  const error = await validateParticipant(
    s.participant,
    eventId,
    Season.Spring
  );
  if (error) {
    return error;
  }

  if (s.pulls.length === 0) {
    return 'At least one pull must be selected.';
  }

  for (let i = 0; i < s.pulls.length; i++) {
    let pull = s.pulls[i];
    if (pull.color === undefined) {
      return `Sweater #${i + 1}: Color is required.`;
    }
    if (pull.size === undefined) {
      return `Sweater #${i + 1}: Size is required.`;
    }
  }

  return null;
}

export default function PullFacForm({
  event,
  location,
  pulls,
}: {
  event: Event;
  location: string;
  pulls: Pulls[];
}) {
  // Info items
  // Skip the date, since this is just an order
  const infoItems: [ElementType, ReactNode][] = makeInfoItems(
    event,
    location
  ).slice(1);

  // Define initial state
  const initialState: State = {
    formState: FormStates.Form,
    participant: emptyParticipantState,
    errorMessage: '',
    comments: '',
    pulls: [{ size: '' }],
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

  // Order list management tools
  const addPull = () => {
    setState((prevState) => ({
      ...prevState,
      pulls: [...prevState.pulls, { size: '' }],
    }));
  };

  const removePull = (index: number) => {
    setState((prevState) => ({
      ...prevState,
      pulls: prevState.pulls.filter((_, i) => i !== index),
    }));
  };

  const updatePull = (
    index: number,
    field: keyof OrderedPull,
    value: string | number
  ) => {
    setState((prevState) => ({
      ...prevState,
      pulls: prevState.pulls.map((pull, i) =>
        i === index ? { ...pull, [field]: value } : pull
      ),
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
                availablePulls={pulls}
                addPull={addPull}
                removePull={removePull}
                updatePull={updatePull}
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
  availablePulls,
  addPull,
  removePull,
  updatePull,
}: {
  s: State;
  setField: <K extends keyof State>(field: K, value: State[K]) => void;
  setParticipantField: <K extends keyof ParticipantState>(
    field: K,
    value: ParticipantState[K]
  ) => void;
  event: Event;
  availablePulls: Pulls[];
  addPull: () => void;
  removePull: (index: number) => void;
  updatePull: (
    index: number,
    field: keyof OrderedPull,
    value: string | number
  ) => void;
}) {
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
          options={SPRING_YEARS.map((v) => ({
            display: v,
            value: v,
          }))}
          dropdownState={{
            value: s.participant.year,
            setValue: (value) => setParticipantField('year', value),
          }}
        />
      </section>
      <section>
        <h2>Order</h2>
        {s.pulls.map((pull, index) => (
          <div key={index} className="pass-through">
            <DropdownCard
              Icon={ColorPickerIcon}
              placeholder="Color"
              options={availablePulls.map((v) => ({
                display: v.name,
                value: v.id,
              }))}
              dropdownState={{
                value: pull.color,
                setValue: (value) => updatePull(index, 'color', value),
              }}
            />
            <DropdownCard
              Icon={SizeIcon}
              placeholder="Size"
              options={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(
                (size) => ({
                  display: size,
                  value: size,
                })
              )}
              dropdownState={{
                value: pull.size,
                setValue: (value) => updatePull(index, 'size', value),
              }}
            />
            <button onClick={() => removePull(index)}>
              <TrashIcon className="icon" /> Delete
            </button>
            <div className="spacer"></div>
          </div>
        ))}
        <button onClick={addPull}>
          <PlusIcon className="icon" /> Add Another
        </button>

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
            await register({
              eventId: event.id,
              participant: s.participant,
              comments: s.comments,
              pulls: s.pulls,
            });
            setField('formState', FormStates.Confirmation);
          } catch (error) {
            setField('errorMessage', error.message);
            setField('formState', FormStates.Error);
          }
        }}
      >
        Confirm Order
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
        <p>Your order has been placed!</p>
      </Card>
      <Markdown>{event.confirmation_text}</Markdown>
    </>
  );
}
