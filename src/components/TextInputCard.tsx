import { ElementType, useRef } from 'react';
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
  const textInputRef = useRef(null);

  return (
    <Card
      Icon={Icon}
      selectable={true}
      onClick={() => textInputRef.current && textInputRef.current.focus()}
    >
      <input
        ref={textInputRef}
        type="text"
        className="text-input"
        placeholder={placeholder}
        onChange={(e) => inputState.setValue(e.target.value)}
        value={inputState.value}
      ></input>
    </Card>
  );
}
