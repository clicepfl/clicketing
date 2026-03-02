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
import { completeOrder, sendClothesOrders } from '@/actions/clothes';
import { Event, Clothes } from '@/types/aliases';
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

type OrderedClothing = {
  color?: number;
  size: string;
};

type State = {
  formState: FormStates;
  participant: ParticipantState;
  errorMessage: string;
  comments: string;
  clothes: OrderedClothing[];
};

async function register({ eventId, participant, comments, clothes }) {
  let orderID = await sendRegistration({
    eventId,
    participant,
    comments,
  });

  await sendClothesOrders({ orderID, clothes });

  await completeOrder({ orderID, orderCount: clothes.length });
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
    return 'At least one sweater must be selected.';
  }

  for (let i = 0; i < s.clothes.length; i++) {
    let clothing = s.clothes[i];
    if (clothing.color === undefined) {
      return `Sweater #${i + 1}: Color is required.`;
    }
    if (clothing.size === undefined) {
      return `Sweater #${i + 1}: Size is required.`;
    }
  }

  return null;
}

export default function FacultyClothesForm({
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
  const addClothing = () => {
    setState((prevState) => ({
      ...prevState,
      clothes: [...prevState.clothes, { size: '' }],
    }));
  };

  const removeClothing = (index: number) => {
    setState((prevState) => ({
      ...prevState,
      clothes: prevState.clothes.filter((_, i) => i !== index),
    }));
  };

  const updateClothing = (
    index: number,
    field: keyof OrderedClothing,
    value: string | number
  ) => {
    setState((prevState) => ({
      ...prevState,
      clothes: prevState.clothes.map((clothing, i) =>
        i === index ? { ...clothing, [field]: value } : clothing
      ),
    }));
  };

  return (
    <div className="form">
      <h1>{event.name}</h1>
      <InfoLine infoItems={infoItems}></InfoLine>

      <Carousel
        images={clothes
          .map((clothing) => [
            {
              src: clothing.front_image ? directusImageSrc(clothing.front_image) : '',
              caption: `${clothing.name} - Front`,
            },
            {
              src: clothing.back_image ? directusImageSrc(clothing.back_image) : '',
              caption: `${clothing.name} - Back`,
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
                addClothing={addClothing}
                removeClothing={removeClothing}
                updateClothing={updateClothing}
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
  addClothing,
  removeClothing,
  updateClothing,
}: {
  s: State;
  setField: <K extends keyof State>(field: K, value: State[K]) => void;
  setParticipantField: <K extends keyof ParticipantState>(
    field: K,
    value: ParticipantState[K]
  ) => void;
  event: Event;
  availableClothes: Clothes[];
  addClothing: () => void;
  removeClothing: (index: number) => void;
  updateClothing: (
    index: number,
    field: keyof OrderedClothing,
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
        {s.clothes.map((clothing, index) => (
          <div key={index} className="pass-through">
            <DropdownCard
              Icon={ColorPickerIcon}
              placeholder="Color"
              options={availableClothes.map((v) => ({
                display: v.name,
                value: v.id,
              }))}
              dropdownState={{
                value: clothing.color,
                setValue: (value) => updateClothing(index, 'color', value),
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
                value: clothing.size,
                setValue: (value) => updateClothing(index, 'size', value),
              }}
            />
            <button onClick={() => removeClothing(index)}>
              <TrashIcon className="icon" /> Delete
            </button>
            <div className="spacer"></div>
          </div>
        ))}
        <button onClick={addClothing}>
          <PlusIcon className="icon" /> Add Another
        </button>
        
        <p><b>Total:</b> {s.clothes.length * event.price} CHF</p>

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
