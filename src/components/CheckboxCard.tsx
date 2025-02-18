import { ReactNode } from 'react';
import Card from './Card';
import Checkbox from './Checkbox';

export default function CheckboxCard({
  children,
}: {
  children: ReactNode;
  checkboxState: {
    value: boolean;
    setValue: (value: boolean) => void;
  };
}) {
  return <Card Icon={Checkbox}>{children}</Card>;
}
