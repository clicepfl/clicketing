import { ElementType } from 'react';
import Card from './Card';

export default function TextInputCard({
  Icon,
  placeholder,
  inputState,
}: {
  Icon: ElementType;
  placeholder: string;
  inputState: {
    value: string;
    setValue: (value: string) => void;
  };
}) {
  return (
    <Card Icon={Icon} selectable={true}>
      <input
        type="text"
        className="text-input"
        placeholder={placeholder}
        onChange={(e) => inputState.setValue(e.target.value)}
        value={inputState.value}
      ></input>
    </Card>
  );
}
