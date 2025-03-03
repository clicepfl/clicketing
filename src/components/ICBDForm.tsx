'use client';

import {
  completeRegistration,
  emailAlreadyUsed,
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
import ErrorIcon from './icons/ErrorIcon';
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
  selectedInterviews: boolean[];
  cvCorrection: boolean;
  cvCorrectionConfirmed: boolean;
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
  noSlotActivitiesIDs,
}) {
  let registrationId = await sendRegistration({
    first_name,
    last_name,
    email: email.toLowerCase(),
    section,
    year,
    eventId,
  });

  await sendICBDActivitiesRegistrations({
    activitiesIDs,
    noSlotActivitiesIDs,
    registrationID: registrationId,
  });

  await completeRegistration(registrationId);
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

  if (s.cvCorrection && !s.cvCorrectionConfirmed) {
    return 'You must be present at the CV presentation';
  }

  if (
    !s.selectedTalks.some((selected) => selected) &&
    !s.selectedDiscussions.some((selected) => selected) &&
    !s.selectedInterviews.some((selected) => selected) &&
    !s.cvCorrection
  ) {
    return 'No activities selected';
  }

  return null;
}

export default function ICBDForm({
  eventId,
  date,
  location,
  deposit,
  talks,
  discussions,
  interviews,
  cvCorrection,
}: {
  eventId: string;
  date: string;
  location: string;
  deposit: string;
  talks: { title: string; time: string; id: number }[];
  discussions: { title: string; time: string; id: number }[];
  interviews: { title: string; time: string; id: number }[];
  cvCorrection: { title: string; time: string; id: number };
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
    selectedTalks: talks.map(() => false),
    selectedDiscussions: discussions.map(() => false),
    selectedInterviews: interviews.map(() => false),
    cvCorrection: false,
    cvCorrectionConfirmed: false,
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
                interviews={interviews}
                cvCorrection={cvCorrection}
                eventId={eventId}
              />
            );
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
  talks,
  discussions,
  interviews,
  cvCorrection,
  eventId,
}: {
  s: State;
  setField: (field: string, value) => void;
  talks: { title: string; time: string; id: number }[];
  discussions: { title: string; time: string; id: number }[];
  interviews: { title: string; time: string; id: number }[];
  cvCorrection: { title: string; time: string; id: number };
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
        <h2>CV Correction</h2>

        <CheckboxCard
          checkboxState={{
            value: s.cvCorrection,
            setValue: (value) => {
              setField('cvCorrection', value);
            },
          }}
        >
          I want to participate in a CV correction
        </CheckboxCard>
        {s.cvCorrection ? (
          <CheckboxCard
            checkboxState={{
              value: s.cvCorrectionConfirmed,
              setValue: (value) => {
                setField('cvCorrectionConfirmed', value);
              },
            }}
          >
            I attest I will be present at the presentation on 7th from 12:15 to
            14:00
          </CheckboxCard>
        ) : (
          <></>
        )}
      </section>

      <section>
        <h2>Interviews</h2>

        <p>
          Your slot for these activities will only be assigned to you when you
          come to pay your deposit of 10CHF at the CLIC Office in INM 177, if
          there are still slots available.
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
                first_name: s.firstName,
                last_name: s.lastName,
                email: s.email,
                section: s.section,
                year: s.year,
                activitiesIDs: [...talksIds, ...discussionsIds],
                noSlotActivitiesIDs: [
                  ...interviewsIds,
                  ...(s.cvCorrection ? [cvCorrection.id] : []),
                ],
              });
              setField('formState', FormStates.Confirmation);
            } catch (error) {
              setField('errorMessage', error.message);
              setField('formState', FormStates.Error);
              console.log(error);
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
        <p>Your registration to ICBD is successful !</p>
      </Card>

      <p>
        Check your email for confirmation, and don't forget to pay your deposit
        at the CLIC office in INM 177. We are available between 10:00 and 17:00
        on weekdays.
      </p>
      <p>This deposit will be refunded to you when you attend the event.</p>
      {interviewSelected && (
        <Card Icon={ErrorIcon}>
          <p>
            You have registered for a <b>Mock Interview</b>,{' '}
            <b>Speed Networking</b> or <b>CV Correction</b> activity. Your slot
            for this activity will only be confirmed after you pay your deposit,
            if slots are still available.
          </p>
        </Card>
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
