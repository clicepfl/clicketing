import { ElementType, useRef } from 'react';
import Card from './Card';

export default function NumberInputCard({
  Icon,
  placeholder,
  inputState,
  max,
}: {
  Icon: ElementType;
  placeholder: string;
  inputState: {
    value: number;
    setValue: (value: number | null) => void;
  };
  max: number;
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
        type="number"
        className="num-input"
        placeholder={placeholder}
        onChange={(e) => {
          inputState.setValue(parseInt(e.target.value));
        }}
        value={inputState.value}
        min={0}
        max={max}
      ></input>
    </Card>
  );
}
