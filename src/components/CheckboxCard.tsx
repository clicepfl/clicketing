import { ReactNode } from 'react';
import Card from './Card';
import Checkbox from './Checkbox';

export default function CheckboxCard({
  children,
  checkboxState,
}: {
  children: ReactNode;
  checkboxState: {
    value: boolean;
    setValue: (value: boolean) => void;
  };
}) {
  return (
    <Card
      selectable={true}
      onClick={() => checkboxState.setValue(!checkboxState.value)}
    >
      <Checkbox
        checked={checkboxState.value}
        setChecked={checkboxState.setValue}
      ></Checkbox>
      {children}
    </Card>
  );
}
