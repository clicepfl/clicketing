'use client';

import {
  sendICBDActivitiesRegistrations,
  sendRegistration,
} from '@/actions/icbd';
import { ElementType, ReactNode, useReducer } from 'react';
import Card from './Card';
import CheckboxCard from './CheckboxCard';
import DropdownCard from './DropdownCard';
import ErrorMessage from './ErrorMessage';
import InfoLine from './InfoLine';
import SplitText from './SplitText';
import TextInputCard from './TextInputCard';
import CalendarIcon from './icons/CalendarIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import EmailIcon from './icons/EmailIcon';
import MapPinIcon from './icons/MapPinIcon';
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
  selectedTalks: boolean[];
  selectedDiscussions: boolean[];
  speedNetworking: boolean;
  mockInterview: boolean;
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
  activitiesIDs,
}) {
  let registrationID = sendRegistration({
    first_name: first_name,
    last_name: last_name,
    email: email,
    section: section,
    year: year,
    eventID: eventId,
  });

  sendICBDActivitiesRegistrations({
    activitiesIDs: activitiesIDs,
    registrationID: registrationID,
  });
}

function validateValues(s: State) {
  if (!s.firstName || s.firstName.length === 0) {
    return 'First name is required';
  }

  if (!s.lastName || s.lastName.length === 0) {
    return 'Last name is required';
  }

  if (!s.email) {
    return 'Email is required';
  }

  if (!/^[A-Za-z]+\.[A-Za-z]+@epfl\.ch$/.test(s.email)) {
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

  if (
    !s.selectedTalks.some((selected) => selected) &&
    !s.selectedDiscussions.some((selected) => selected) &&
    !s.speedNetworking &&
    !s.mockInterview
  ) {
    return 'No activities selected';
  }

  return null;
}

export default function ICBDForm({
  eventId,
  date,
  location,
  caution,
  talks,
  discussions,
}: {
  eventId: string;
  date: string;
  location: string;
  caution: string;
  talks: { title: string; time: string; id: number }[];
  discussions: { title: string; time: string; id: number }[];
}) {
  // Info items
  const infoItems: [ElementType, ReactNode][] = [
    [CalendarIcon, date],
    [MapPinIcon, location],
    [PriceIcon, caution],
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
    selectedTalks: talks.map(() => false),
    selectedDiscussions: discussions.map(() => false),
    speedNetworking: false,
    mockInterview: false,
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
        throw Error('Unknown action');
    }
  }

  function setField(field, value) {
    dispatch({ type: 'SET_FIELD', field, value });
  }

  // Use reducer
  const [state, dispatch] = useReducer(reducer, initialState);

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
                talks={talks}
                discussions={discussions}
                eventId={eventId}
              ></Form>
            );
          case FormStates.Loading:
            return <Loading></Loading>;
          case FormStates.Confirmation:
            return <Confirmation></Confirmation>;
          case FormStates.Error:
            return <Error></Error>;
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
  talks,
  discussions,
  eventId,
}: {
  s: State;
  setField: (field: string, value) => void;
  talks: { title: string; time: string; id: number }[];
  discussions: { title: string; time: string; id: number }[];
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
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
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
          options={Object.values(Sections)}
          dropdownState={{
            value: s.section,
            setValue: (value) => setField('section', value),
          }}
        />

        <DropdownCard
          Icon={TeamIcon}
          placeholder="Year"
          options={Object.values(Years)}
          dropdownState={{
            value: s.year,
            setValue: (value) => setField('year', value),
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
        <h2>Speed Networking</h2>

        <p>
          Your slot will be assigned to you when you come to pay your caution of
          10CHF at the CLIC Office in INM 117 [...?].
        </p>

        <CheckboxCard
          checkboxState={{
            value: s.speedNetworking,
            setValue: (value) => setField('speedNetworking', value),
          }}
        >
          <SplitText
            snippets={['I would like to participate in the Speed Networking']}
          ></SplitText>
        </CheckboxCard>
      </section>

      <section>
        <h2>Mock Interview</h2>

        <p>
          Your slot will be assigned to you when you come to pay your caution of
          10CHF at the CLIC Office in INM 117 [...?].
        </p>

        <CheckboxCard
          checkboxState={{
            value: s.mockInterview,
            setValue: (value) => setField('mockInterview', value),
          }}
        >
          <SplitText
            snippets={['I would like to participate in a Mock Interview']}
          ></SplitText>
        </CheckboxCard>
      </section>

      <button
        onClick={() => {
          const error = validateValues(s);

          setField('errorMessage', error);

          if (!error) {
            let talksIds = talks
              .filter((talk, i) => s.selectedTalks[i])
              .map((talk) => talk.id);
            let discussionsIds = discussions
              .filter((discussion, i) => s.selectedDiscussions[i])
              .map((discussion) => discussion.id);

            setField('formState', FormStates.Loading);

            register({
              eventId,
              first_name: s.firstName,
              last_name: s.lastName,
              email: s.email,
              section: s.section,
              year: s.year,
              activitiesIDs: [...talksIds, ...discussionsIds],
            })
              .then(() => {
                setField('formState', FormStates.Confirmation);
              })
              .catch((error) => {
                setField('errorMessage', error);
                setField('formState', FormStates.Error);
              });
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

function Confirmation({}) {
  return (
    <>
      <Card Icon={CheckCircleIcon}>
        <p>Your registration to ICBD is successful !</p>
      </Card>
      <p>
        Check your email for confirmation, and don't forget to pay your caution
        at the CLIC office{/*TODO*/}
      </p>
    </>
  );
}

function Error({}) {
  return (
    <>
      <p>Registration failed</p>
      <p>Please refresh the page and try again</p>
      <p>Contact clic@epfl.ch if the issue persists</p>
    </>
  );
}
