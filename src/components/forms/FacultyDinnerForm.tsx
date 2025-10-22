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
import { Event } from '@/types/aliases';
import { ElementType, ReactNode, useState } from 'react';
import Card from '../Card';
import CheckboxCard from '../CheckboxCard';
import DropdownCard from '../DropdownCard';
import ErrorMessage from '../ErrorMessage';
import InfoLine from '../InfoLine';
import LargeTextInputCard from '../LargeTextInputCard';
import NumberInputCard from '../NumberInputCard copy';
import TextInputCard from '../TextInputCard';
import AllergyIcon from '../icons/AllergyIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import EmailIcon from '../icons/EmailIcon';
import InfoIcon from '../icons/InfoIcon';
import MenuIcon from '../icons/MenuIcon';
import TeamIcon from '../icons/TeamIcon';
import UserIcon from '../icons/UserIcon';

type State = {
  formState: FormStates;
  participant: ParticipantState;
  consent: boolean;
  errorMessage: string;
  mealId: null | number;
  comments: string;
  plus_ones: number;
};

export interface Meal {
  name: string;
  description: string;
}

async function validateValues(s: State, eventId: number, guest: boolean) {
  const error = await validateParticipant(
    s.participant,
    eventId,
    Season.Spring,
    true, // only IC
    guest,
    guest,
    guest
  ); // for guests allow external email, no section and no year

  if (error) {
    return error;
  }

  if (s.mealId === null) {
    return 'Menu is required';
  }

  if (guest) {
    if (s.plus_ones < 0) {
      return 'Number of guests is invalid';
    }
    if (s.plus_ones > 5) {
      return 'You can only bring up to 5 guests';
    }
  }

  if (!s.consent) {
    return 'Consent is required';
  }

  return null;
}

export default function FacultyDinnerForm({
  event,
  location,
  guest = false,
}: {
  event: Event;
  location: string;
  guest: boolean;
}) {
  // Info items
  const infoItems: [ElementType, ReactNode][] = makeInfoItems(event, location);

  const meals: Meal[] = event.meals as Meal[];

  // Define initial state
  const initialState: State = {
    formState: FormStates.Form,
    participant: emptyParticipantState,
    consent: false,
    errorMessage: '',
    mealId: null,
    comments: '',
    plus_ones: null,
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
      <h1>Faculty Dinner</h1>
      <InfoLine infoItems={infoItems}></InfoLine>

      {(() => {
        switch (state.formState) {
          case FormStates.Form:
            return (
              <Form
                s={state}
                setField={setField}
                setParticipantField={setParticipantField}
                eventId={event.id}
                meals={meals}
                guest={guest}
              />
            );
          case FormStates.Loading:
            return <Loading></Loading>;
          case FormStates.Confirmation:
            return <Confirmation guest={guest} />;
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
  eventId,
  meals,
  guest,
}: {
  s: State;
  setField: <K extends keyof State>(field: K, value: State[K]) => void;
  setParticipantField: <K extends keyof ParticipantState>(
    field: K,
    value: ParticipantState[K]
  ) => void;
  eventId: number;
  meals: Meal[];
  guest: boolean;
}) {
  return (
    <>
      {guest ? (
        <>
          <Card Icon={InfoIcon}>
            <p>
              This form is for guests, such as professors, collaborators of the
              IC Faculty or CLIC former members. If you are a student, please
              register on the student form instead.
            </p>
          </Card>
          <p>
            The IC Faculty Dinner is a traditional evening organized by CLIC for
            students, professors and other Faculty members.
          </p>
          <p>
            You can pay on the day of the event, or by bank transfer using the
            QR code you'll receive by email after registration.
          </p>
        </>
      ) : (
        <section>
          <p>
            The IC Faculty Dinner is a traditional evening organized by CLIC for
            students, professors and other Faculty members.
          </p>
          <p>
            You can pay your seat by cash or camipro at the INM office in
            INM177, or by bank transfer using the QR code you'll receive by
            email after registration.
          </p>
        </section>
      )}

      <h2>Menu</h2>
      <section className="menu">
        {meals.map((meal, index) => (
          <div className="menu-item" key={index}>
            <b>{meal.name}</b>
            <div className="menu-desc">{meal.description}</div>
          </div>
        ))}
      </section>
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

        {/* Hide these for guests */}
        {guest ? (
          <></>
        ) : (
          <>
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
          </>
        )}

        <DropdownCard
          Icon={MenuIcon}
          placeholder="Menu"
          options={meals.map((meal, index) => ({
            display: meal.name,
            value: index,
          }))}
          dropdownState={{
            value: s.mealId,
            setValue: (value) => setField('mealId', value),
          }}
        />

        {guest ? (
          <NumberInputCard
            Icon={TeamIcon}
            placeholder="Number of plus ones"
            inputState={{
              value: s.plus_ones,
              setValue: (value) => setField('plus_ones', value),
            }}
            max={5}
          />
        ) : (
          <></>
        )}

        <LargeTextInputCard
          Icon={AllergyIcon}
          placeholder={
            guest
              ? 'Plus ones menus & Allergies & Dietary restrictions'
              : 'Allergies & Dietary restrictions'
          }
          inputState={{
            value: s.comments,
            setValue: (value) => setField('comments', value),
          }}
          rows={3}
        />

        <CheckboxCard
          checkboxState={{
            value: s.consent,
            setValue: (value) => setField('consent', value),
          }}
        >
          I consent to CLIC taking photographs of me at the Faculty Dinner and
          using them for promotional purposes.{' '}
          {guest
            ? 'I confirm that any plus ones I register also consent to this.'
            : ''}
        </CheckboxCard>
      </section>

      <button
        onClick={async () => {
          const error = await validateValues(s, eventId, guest);

          if (error) {
            setField('errorMessage', error);
            return;
          }

          setField('formState', FormStates.Loading);

          try {
            await sendRegistration({
              eventId,
              participant: {
                firstName: s.participant.firstName,
                lastName: s.participant.lastName,
                email: s.participant.email.toLowerCase(),
                section: guest ? 'Guest' : s.participant.section,
                year: guest ? 'Guest' : s.participant.year,
              },
              meal: s.mealId,
              comments: s.comments,
              plus_ones: guest ? s.plus_ones : 0,
              guest,
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

function Confirmation({ guest }: { guest: boolean }) {
  return (
    <>
      <Card Icon={CheckCircleIcon}>
        <p>Your registration to the Faculty Dinner is successful !</p>
      </Card>
      {guest ? (
        <p>
          Check your email for confirmation, and pay the entrance fee either by
          QR facture, or directly at the event by cash or camipro.
        </p>
      ) : (
        <p>
          Check your email for confirmation, and don't forget to pay your
          entrance fee either by QR facture, or at the CLIC office in INM 177
          (by cash or camipro). We are available between 10:00 and 17:00 on
          weekdays.
        </p>
      )}
    </>
  );
}
