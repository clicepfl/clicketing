'use client';
import {
  FormStates,
  ParticipantState,
  Season,
  emptyParticipantState,
  makeInfoItems,
  validateParticipant,
} from '@/actions/common-client';
import { sendRegistration } from '@/actions/common-server';
import {
  sendIcelanTournamentInterests,
  validateIcelanInfo,
} from '@/actions/icelan';
import { Event, IcelanTournoi } from '@/types/aliases';
import { ElementType, ReactNode, useState } from 'react';
import Markdown from 'react-markdown';
import Card from '../Card';
import CheckboxCard from '../CheckboxCard';
import ErrorMessage from '../ErrorMessage';
import InfoLine from '../InfoLine';
import LargeTextInputCard from '../LargeTextInputCard';
import NumberInputCard from '../NumberInputCard copy';
import SplitText from '../SplitText';
import TextInputCard from '../TextInputCard';
import AllergyIcon from '../icons/AllergyIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import EmailIcon from '../icons/EmailIcon';
import PencilIcon from '../icons/PencilIcon';
import PriceIcon from '../icons/PriceIcon';
import UserIcon from '../icons/UserIcon';

type State = {
  formState: FormStates;
  participant: ParticipantState;
  consent: boolean;
  read_rules: boolean;
  comments: string;
  allergies: string;
  pseudonym: string;
  discord_username: string;
  student: boolean;
  handicaped: boolean;
  donation: number;
  selectedTournaments: boolean[];
  errorMessage: string;
};

async function validateValues(s: State, eventId: number) {
  let error = await validateParticipant(
    s.participant,
    eventId,
    Season.Autumn,
    false,
    true,
    true,
    true
  );

  if (error) {
    return error;
  } else {
    error = await validateIcelanInfo(s.pseudonym, s.discord_username, eventId);
  }

  if (error) {
    return error;
  }

  if (!s.read_rules) {
    return 'You need to read and approve the rules';
  }

  if (!s.consent) {
    return 'Consent is required';
  }

  return null;
}

export default function IcelanForm({
  event,
  tournaments,
}: {
  event: Event;
  tournaments: IcelanTournoi[];
}) {
  // Info items
  const infoItems: [ElementType, ReactNode][] = makeInfoItems(event);

  // Define initial state
  const initialState: State = {
    formState: FormStates.Form,
    participant: emptyParticipantState,
    consent: false,
    read_rules: false,
    comments: '',
    allergies: '',
    pseudonym: '',
    discord_username: '',
    student: false,
    handicaped: false,
    donation: null,
    selectedTournaments: tournaments.map(() => false),
    errorMessage: '',
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
                tournaments={tournaments}
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
  tournaments,
}: {
  s: State;
  setField: <K extends keyof State>(field: K, value: State[K]) => void;
  setParticipantField: <K extends keyof ParticipantState>(
    field: K,
    value: ParticipantState[K]
  ) => void;
  event: Event;
  tournaments: IcelanTournoi[];
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
        <Markdown>{event.intro_text}</Markdown>
        <h2>Informations générales</h2>
        <TextInputCard
          Icon={UserIcon}
          placeholder="Prénom"
          inputState={{
            value: s.participant.firstName,
            setValue: (value) => setParticipantField('firstName', value),
          }}
        />
        <TextInputCard
          Icon={UserIcon}
          placeholder="Nom"
          inputState={{
            value: s.participant.lastName,
            setValue: (value) => setParticipantField('lastName', value),
          }}
        />
        <TextInputCard
          Icon={EmailIcon}
          placeholder="Email (mail étudiant pour le rabais)"
          inputState={{
            value: s.participant.email,
            setValue: (value) => setParticipantField('email', value),
          }}
        />
        <TextInputCard
          Icon={UserIcon}
          placeholder="Pseudonyme"
          inputState={{
            value: s.pseudonym,
            setValue: (value) => setField('pseudonym', value),
          }}
        />
        <TextInputCard
          Icon={UserIcon}
          placeholder="Pseudo Discord"
          inputState={{
            value: s.discord_username,
            setValue: (value) => setField('discord_username', value),
          }}
        />
        <CheckboxCard
          checkboxState={{
            value: s.student,
            setValue: (value) => setField('student', value),
          }}
        >
          Je suis étudiant·e
        </CheckboxCard>
        <CheckboxCard
          checkboxState={{
            value: s.handicaped,
            setValue: (value) => setField('handicaped', value),
          }}
        >
          J'ai besoin d'accès handicapé
        </CheckboxCard>
        <LargeTextInputCard
          Icon={AllergyIcon}
          placeholder="Allergies et Restrictions alimentaires (laisser vide si aucune)"
          inputState={{
            value: s.allergies,
            setValue: (value) => setField('allergies', value),
          }}
          rows={2}
        />
      </section>

      <section>
        <h2>Tournois</h2>
        <p>
          La question suivante est seulement à titre indicatif, elle nous permet
          d'estimer le nombre de participant·e·s à chaque tournoi afin
          d'optimiser le planning. La liste est susceptible d'évoluer d'ici à
          l'événement.
        </p>
        <p>
          <br />À quels tournois souhaites-tu participer ?
        </p>
        {tournaments.map((tournament, i) => (
          <CheckboxCard
            key={i}
            checkboxState={{
              value: s.selectedTournaments[i],
              setValue: (value) => {
                setField(
                  'selectedTournaments',
                  changeSelection(i, value, s.selectedTournaments)
                );
              },
            }}
          >
            <SplitText snippets={[tournament.name]} />
          </CheckboxCard>
        ))}
      </section>

      <section>
        <h2>Nous soutenir</h2>
        <p>
          Si tu penses que l'événement vaut plus, tu as la possibilité de faire
          un don à Game*, la commission organisatrice ! Tu peux indiquer le
          montant de ton don ci-dessous :
        </p>
        <NumberInputCard
          Icon={PriceIcon}
          placeholder="Don"
          inputState={{
            value: s.donation,
            setValue: (value) => setField('donation', value),
          }}
          max={10000}
        />
        <p>Le don sera automatiquement ajouté au montant de la facture.</p>
      </section>

      <section>
        <h2>Règlement</h2>
        <p>
          Disponible ici:{' '}
          <a href="https://icelan.ch/reglement" target="_blank">
            https://icelan.ch/reglement
          </a>
          <br />
          <br />
          On sait qu'en général les gens acceptent sans lire, donc le résumé
          c'est :
        </p>
        <ul>
          <li>Sois respectueux·euse des gens, du matériel et des lieux.</li>
          <li>
            S'il y a un problème, on se réserve le droit de t'exclure de
            l'événement si nécessaire, sans remboursement.
          </li>
        </ul>
        <p>
          <br />
          Merci d'avance !
        </p>

        <CheckboxCard
          checkboxState={{
            value: s.read_rules,
            setValue: (value) => setField('read_rules', value),
          }}
        >
          J'atteste avoir lu et accepté le règlement de l'événement.
        </CheckboxCard>

        <CheckboxCard
          checkboxState={{
            value: s.consent,
            setValue: (value) => setField('consent', value),
          }}
        >
          J'autorise Game*, les services de l'EPFL, et toute autre entité
          concernée par l'événement à utiliser, reproduire et diffuser à titre
          gratuit mon image et ma prestation enregistrées lors de l'événement.
        </CheckboxCard>

        <LargeTextInputCard
          Icon={PencilIcon}
          placeholder="Commentaire additionnel"
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
            let registrationId = await sendRegistration({
              eventId: event.id,
              participant: s.participant,
              comments: s.comments,
              price_to_pay: s.student ? 'first_price' : 'second_price',
              additionalInfos: {
                donation: s.donation,
                student: s.student,
                handicaped: s.handicaped,
                allergies: s.allergies,
                pseudonym: s.pseudonym,
                discord_username: s.discord_username,
              },
            });
            await sendIcelanTournamentInterests({
              registrationID: registrationId,
              tournamentIDs: tournaments
                .filter((tournament, i) => s.selectedTournaments[i])
                .map((tournament) => tournament.id),
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

function Confirmation({ event }: { event: Event }) {
  return (
    <>
      <Card Icon={CheckCircleIcon}>
        <p>Your registration to {event.name} is successful !</p>
      </Card>
      <Markdown>{event.confirmation_text}</Markdown>
    </>
  );
}
