'use client';

import { emailAlreadyUsed } from '@/actions/common';
import { sendRegistration } from '@/actions/faculty-dinner';
import { ElementType, ReactNode, useReducer } from 'react';
import Card from '../Card';
import CheckboxCard from '../CheckboxCard';
import DropdownCard from '../DropdownCard';
import ErrorMessage from '../ErrorMessage';
import InfoLine from '../InfoLine';
import LargeTextInputCard from '../LargeTextInputCard';
import NumberInputCard from '../NumberInputCard copy';
import TextInputCard from '../TextInputCard';
import AllergyIcon from '../icons/AllergyIcon';
import CalendarIcon from '../icons/CalendarIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import EmailIcon from '../icons/EmailIcon';
import InfoIcon from '../icons/InfoIcon';
import MapPinIcon from '../icons/MapPinIcon';
import MenuIcon from '../icons/MenuIcon';
import PriceIcon from '../icons/PriceIcon';
import TeamIcon from '../icons/TeamIcon';
import UserIcon from '../icons/UserIcon';

type State = {
  formState: FormStates;
  firstName: string;
  lastName: string;
  email: string;
  section: string;
  year: string;
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

enum FormStates {
  Form,
  Loading,
  Confirmation,
  Error,
}

enum Years {
  MAN = 'MAN',
  BA2 = 'BA2',
  BA4 = 'BA4',
  BA6 = 'BA6',
  MA2 = 'MA2',
  MA4 = 'MA4',
  PhD = 'PhD',
  Other = 'Other',
}

enum Sections {
  ComputerScience = 'Computer Science',
  CommunicationSystems = 'Communication Systems',
  DataScience = 'Data Science',
  CyberSecurity = 'Cyber Security',
}

async function register({
  eventId,
  first_name,
  last_name,
  email,
  section,
  year,
  meal,
  comments,
  plus_ones,
}) {
  let registrationId = await sendRegistration({
    first_name,
    last_name,
    email: email.toLowerCase(),
    section,
    year,
    eventId,
    meal,
    comments,
    plus_ones,
  });
}

async function validateValues(s: State, eventId: string, guest: boolean) {
  if (!s.firstName || s.firstName.length === 0) {
    return 'First name is required';
  }

  if (!s.lastName || s.lastName.length === 0) {
    return 'Last name is required';
  }

  if (!s.email) {
    return 'Email is required';
  }
  if (await emailAlreadyUsed(s.email.toLowerCase(), eventId)) {
    return 'Email is already used';
  }

  if (!/^[A-Za-z\-]+\.[A-Za-z\-]+@epfl\.ch$/.test(s.email)) {
    return 'Email must be EPFL email';
  }

  if (!guest) {
    if (
      !s.section ||
      !Object.values(Sections).includes(s.section as Sections)
    ) {
      return 'Section is required';
    }

    if (!s.year || !Object.values(Years).includes(s.year as Years)) {
      return 'Year is required';
    }
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
  eventId,
  date,
  location,
  deposit,
  meals,
  guest = false,
}: {
  eventId: string;
  date: string;
  location: string;
  deposit: string;
  meals: Meal[];
  guest: boolean;
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
    firstName: '',
    lastName: '',
    email: '',
    section: '',
    year: '',
    consent: false,
    errorMessage: '',
    mealId: null,
    comments: '',
    plus_ones: null,
  };

  // Define reducer
  function reducer(state, action) {
    switch (action.type) {
      case 'SET_FIELD':
        return { ...state, [action.field]: action.value };
      case 'SET_ERROR':
        return { ...state, errorMessage: action.value };
      default:
        throw Error('Invalid action type');
    }
  }

  function setField(field, value) {
    dispatch({ type: 'SET_FIELD', field, value });
  }

  // Use reducer
  const [state, dispatch] = useReducer(reducer, initialState);

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
                eventId={eventId}
                meals={meals}
                guest={guest}
              />
            );
          case FormStates.Loading:
            return <Loading></Loading>;
          case FormStates.Confirmation:
            return <Confirmation guest={guest} />;
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
  eventId,
  meals,
  guest,
}: {
  s: State;
  setField: (field: string, value) => void;
  eventId: string;
  meals: Meal[];
  guest: boolean;
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
      {guest ? (
        <Card Icon={InfoIcon}>
          <p>
            This form is for guests, such as professors. If you are a student,
            please register on the student form instead.
          </p>
        </Card>
      ) : (
        <></>
      )}

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
            value: s.firstName,
            setValue: (value) => setField('firstName', value),
          }}
        />
        <TextInputCard
          Icon={UserIcon}
          placeholder="Last Name"
          inputState={{
            value: s.lastName,
            setValue: (value) => setField('lastName', value),
          }}
        />
        <TextInputCard
          Icon={EmailIcon}
          placeholder="EPFL Email"
          inputState={{
            value: s.email,
            setValue: (value) => setField('email', value),
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
              options={Object.values(Sections).map((v) => ({
                display: v,
                value: v,
              }))}
              dropdownState={{
                value: s.section,
                setValue: (value) => setField('section', value),
              }}
            />

            <DropdownCard
              Icon={TeamIcon}
              placeholder="Year"
              options={Object.values(Years).map((v) => ({
                display: v,
                value: v,
              }))}
              dropdownState={{
                value: s.year,
                setValue: (value) => setField('year', value),
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

        <LargeTextInputCard
          Icon={AllergyIcon}
          placeholder="Allergies & Dietary restrictions"
          inputState={{
            value: s.comments,
            setValue: (value) => setField('comments', value),
          }}
          rows={3}
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
            await register({
              eventId,
              first_name: s.firstName,
              last_name: s.lastName,
              email: s.email,
              section: guest ? 'Guest' : s.section,
              year: guest ? 'Guest' : s.year,
              meal: s.mealId,
              comments: s.comments,
              plus_ones: guest ? s.plus_ones : 0,
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

function ErrorDisplay({ message }: { message: string }) {
  return (
    <>
      <p>Registration failed: {message}</p>
      <p>Please refresh the page and try again</p>
      <p>Contact clic@epfl.ch if the issue persists</p>
    </>
  );
}
