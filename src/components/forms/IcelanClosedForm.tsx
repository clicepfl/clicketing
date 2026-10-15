'use client';

import { sendWaitingList } from '@/actions/icelan';
import { directus } from '@/directus';
import { readItems, readSingleton } from '@directus/sdk';
import { useState } from 'react';
import ErrorMessage from '../ErrorMessage';
import TextInputCard from '../TextInputCard';
import EmailIcon from '../icons/EmailIcon';

type State = {
  email: string;
  errorMessage: string;
};

export async function waitingListLength(): Promise<number> {
  return (await directus().request(readSingleton('icelan')))
    .waiting_list_length;
}

export async function alreadyInWatingList(email: string): Promise<boolean> {
  const registrations = await directus().request(
    readItems('icelan_waiting_list', {
      filter: {
        _and: [{ email: { _eq: email } }],
      },
    })
  );

  return registrations.length !== 0;
}

async function validateValues(s: State) {
  if (!s.email) {
    return 'Email is required';
  }
  if (await alreadyInWatingList(s.email.toLowerCase())) {
    return 'Email is already used';
  }
  return null;
}

export default function IcelanClosedForm() {
  // Define initial state
  const initialState: State = {
    email: '',
    errorMessage: '',
  };

  const [state, setState] = useState(initialState);

  const setField = <K extends keyof State>(field: K, value: State[K]) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  return (
    <div className="form">
      <h1>Y'a plus de place QwQ</h1>
      <p>
        Trop triiiist... on aurait adoré t'acceuwir. Heureusement on a une file
        d'attente au cas où une place se libère. UwU
        <br />
        <br />
        Longueur de la file d'attente : {waitingListLength()}
      </p>
      <TextInputCard
        Icon={EmailIcon}
        placeholder="Email"
        inputState={{
          value: state.email,
          setValue: (value) => setField('email', value),
        }}
      />
      <button
        onClick={async () => {
          const error = await validateValues(state);

          if (error) {
            setField('errorMessage', error);
            return;
          }

          try {
            await sendWaitingList({ email: state.email });
          } catch (error) {
            setField('errorMessage', error.message);
          }
        }}
      >
        S'inscrire à la file d'attente
      </button>

      <ErrorMessage message={state.errorMessage}></ErrorMessage>
    </div>
  );
}
