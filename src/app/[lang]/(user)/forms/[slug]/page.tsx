import Card from '@/components/Card';
import CalendarIcon from '@/components/icons/CalendarIcon';
import CutleryIcon from '@/components/icons/CutleryIcon';
import MapPinIcon from '@/components/icons/MapPinIcon';
import PriceIcon from '@/components/icons/PriceIcon';
import TeamIcon from '@/components/icons/TeamIcon';
import UserIcon from '@/components/icons/UserIcon';
import InfoLine from '@/components/InfoLine';
import { ElementType, ReactNode } from 'react';

export default function Home() {
  const infoItems: [ElementType, ReactNode][] = [
    [CalendarIcon, '12/12/2022'],
    [MapPinIcon, 'BC Building'],
    [PriceIcon, 'Free'],
  ];
  return (
    <div className="form">
      <h1>Event</h1>
      <InfoLine infoItems={infoItems}></InfoLine>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
      <section>
        <Card Icon={UserIcon}>Name Surname</Card>
        <Card Icon={CutleryIcon}>Menu</Card>
        <Card Icon={TeamIcon}>Group</Card>
      </section>
      <button>Confirm Registration</button>
    </div>
  );
}
