'use client';

import { emailAlreadyUsed } from '@/actions/common';
import { sendRegistration } from '@/actions/faculty-dinner';
import { ElementType, ReactNode, useReducer } from 'react';
import Card from './Card';
import CheckboxCard from './CheckboxCard';
import DropdownCard from './DropdownCard';
import ErrorMessage from './ErrorMessage';
import InfoLine from './InfoLine';
import TextInputCard from './TextInputCard';
import CalendarIcon from './icons/CalendarIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import EmailIcon from './icons/EmailIcon';
import MapPinIcon from './icons/MapPinIcon';
import MenuIcon from './icons/MenuIcon';
import PriceIcon from './icons/PriceIcon';
import TeamIcon from './icons/TeamIcon';
import UserIcon from './icons/UserIcon';

type State = {
  formState: FormStates;
  firstName: string;
  lastName: string;
  email: string;
  section: string;
  year: string;
  consent: boolean;
  errorMessage: string;
};

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
}) {
  let registrationId = await sendRegistration({
    first_name,
    last_name,
    email: email.toLowerCase(),
    section,
    year,
    eventId,
  });
}

async function validateValues(s: State, eventId: string) {
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

  if (!s.section || !Object.values(Sections).includes(s.section as Sections)) {
    return 'Section is required';
  }

  if (!s.year || !Object.values(Years).includes(s.year as Years)) {
    return 'Year is required';
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
}: {
  eventId: string;
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
  const initialState = {
    formState: FormStates.Form,
    firstName: '',
    lastName: '',
    email: '',
    section: '',
    year: '',
    consent: false,
    errorMessage: '',
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
            return <Form s={state} setField={setField} eventId={eventId} />;
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
  eventId,
}: {
  s: State;
  setField: (field: string, value) => void;
  eventId: string;
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

        <DropdownCard
          Icon={MenuIcon}
          placeholder="Menu"
          options={Object.values(Years).map((v) => ({
            display: v,
            value: v,
          }))}
          dropdownState={{
            value: s.year,
            setValue: (value) => setField('menu', value),
          }}
        />

        <CheckboxCard
          checkboxState={{
            value: s.consent,
            setValue: (value) => setField('consent', value),
          }}
        >
          I consent to CLIC taking photographs of me at the Faculty Dinner and
          using them for promotional purposes.
        </CheckboxCard>
      </section>

      <button
        onClick={async () => {
          const error = await validateValues(s, eventId);

          setField('errorMessage', error);

          if (!error) {
            setField('formState', FormStates.Loading);

            try {
              await register({
                eventId,
                first_name: s.firstName,
                last_name: s.lastName,
                email: s.email,
                section: s.section,
                year: s.year,
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
        <p>Your registration to the Faculty Dinner is successful !</p>
      </Card>

      <p>
        Check your email for confirmation, and don't forget to pay your deposit
        either by QR facture or at the CLIC office in INM 177. We are available
        between 10:00 and 17:00 on weekdays.
      </p>
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
