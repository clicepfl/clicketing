'use client';
import { completeOrder, sendClothesOrders } from '@/actions/clothes';
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
import { Clothes, Event } from '@/types/aliases';
import { ElementType, ReactNode, useState } from 'react';
import Markdown from 'react-markdown';
import Card from '../Card';
import Carousel from '../Carousel';
import { directusImageSrc } from '../DirectusImage';
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

type OrderedCloth = {
  color?: number;
  size: string;
};

type State = {
  formState: FormStates;
  participant: ParticipantState;
  errorMessage: string;
  comments: string;
  clothes: OrderedCloth[];
};

async function register({ eventId, participant, comments, clothes }) {
  let orderID = await sendRegistration({
    eventId,
    participant,
    comments,
  });

  await sendClothesOrders({ orderID, clothes });

  await completeOrder({ orderID });
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

  if (s.clothes.length === 0) {
    return 'At least one pull must be selected.';
  }

  for (let i = 0; i < s.clothes.length; i++) {
    let cloth = s.clothes[i];
    if (cloth.color === undefined) {
      return `Pull #${i + 1}: Color is required.`;
    }
    if (cloth.size === undefined) {
      return `Pull #${i + 1}: Size is required.`;
    }
  }

  return null;
}

export default function PullFacForm({
  event,
  location,
  clothes,
}: {
  event: Event;
  location: string;
  clothes: Clothes[];
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
    clothes: [{ size: '' }],
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
      clothes: [...prevState.clothes, { size: '' }],
    }));
  };

  const removePull = (index: number) => {
    setState((prevState) => ({
      ...prevState,
      clothes: prevState.clothes.filter((_, i) => i !== index),
    }));
  };

  const updatePull = (
    index: number,
    field: keyof OrderedCloth,
    value: string | number
  ) => {
    setState((prevState) => ({
      ...prevState,
      clothes: prevState.clothes.map((pull, i) =>
        i === index ? { ...pull, [field]: value } : pull
      ),
    }));
  };

  return (
    <div className="form">
      <h1>{event.name}</h1>
      <InfoLine infoItems={infoItems}></InfoLine>

      <Carousel
        images={clothes
          .map((pull) => [
            {
              src: pull.front_image ? directusImageSrc(pull.front_image) : '',
              caption: `${pull.name} - Front`,
            },
            {
              src: pull.back_image ? directusImageSrc(pull.back_image) : '',
              caption: `${pull.name} - Back`,
            },
          ])
          .flat()}
      />

      {(() => {
        switch (state.formState) {
          case FormStates.Form:
            return (
              <Form
                s={state}
                setField={setField}
                setParticipantField={setParticipantField}
                event={event}
                availableClothes={clothes}
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
  availableClothes,
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
  availableClothes: Clothes[];
  addPull: () => void;
  removePull: (index: number) => void;
  updatePull: (
    index: number,
    field: keyof OrderedCloth,
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
        {s.clothes.map((pull, index) => (
          <div key={index} className="pass-through">
            <DropdownCard
              Icon={ColorPickerIcon}
              placeholder="Color"
              options={availableClothes.map((v) => ({
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
              clothes: s.clothes,
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
