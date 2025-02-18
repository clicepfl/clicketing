'use client';

import { ElementType, ReactNode, useState } from 'react';
import CheckboxCard from './CheckboxCard';
import DropdownCard from './DropdownCard';
import InfoLine from './InfoLine';
import SplitText from './SplitText';
import TextInputCard from './TextInputCard';
import CalendarIcon from './icons/CalendarIcon';
import EmailIcon from './icons/EmailIcon';
import MapPinIcon from './icons/MapPinIcon';
import PriceIcon from './icons/PriceIcon';
import TeamIcon from './icons/TeamIcon';
import UserIcon from './icons/UserIcon';

export default function ICBDForm({
  date,
  location,
  caution,
  talks,
  discussions,
}: {
  date: string;
  location: string;
  caution: string;
  talks: { title: string; time: string }[];
  discussions: { title: string; time: string }[];
}) {
  // Info items
  const infoItems: [ElementType, ReactNode][] = [
    [CalendarIcon, date],
    [MapPinIcon, location],
    [PriceIcon, caution],
  ];

  // Create states for first name, last name, email, section, and consent
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [section, setSection] = useState('');
  const [consent, setConsent] = useState(false);

  // Create array states for talks and discussions
  const [selectedTalks, setSelectedTalks] = useState(talks.map(() => false));
  const [selectedDiscussions, setSelectedDiscussions] = useState(
    discussions.map(() => false)
  );

  // Creates states for speed networking and mock interview
  const [speedNetworking, setSpeedNetworking] = useState(false);
  const [mockInterview, setMockInterview] = useState(false);

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
    <div className="form">
      <h1>ICBD Registration</h1>
      <InfoLine infoItems={infoItems}></InfoLine>
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
          inputState={{ value: firstName, setValue: setFirstName }}
        />
        <TextInputCard
          Icon={UserIcon}
          placeholder="Last Name"
          inputState={{ value: lastName, setValue: setLastName }}
        />
        <TextInputCard
          Icon={EmailIcon}
          placeholder="Email"
          inputState={{ value: email, setValue: setEmail }}
        />

        <DropdownCard
          Icon={TeamIcon}
          placeholder="Section"
          options={['IC', 'SC']}
          dropdownState={{ value: section, setValue: setSection }}
        />

        <CheckboxCard checkboxState={{ value: consent, setValue: setConsent }}>
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
              value: selectedTalks[i],
              setValue: (value) => {
                setSelectedTalks((oldValues) =>
                  changeSelection(i, value, oldValues)
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
              value: selectedDiscussions[i],
              setValue: (value) => {
                setSelectedDiscussions((oldValues) =>
                  changeSelection(i, value, oldValues)
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
            value: speedNetworking,
            setValue: setSpeedNetworking,
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
          checkboxState={{ value: mockInterview, setValue: setMockInterview }}
        >
          <SplitText
            snippets={['I would like to participate in a Mock Interview']}
          ></SplitText>
        </CheckboxCard>
      </section>

      <button>Confirm Registration</button>
    </div>
  );
}
