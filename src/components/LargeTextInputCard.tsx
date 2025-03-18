import { ElementType, useRef } from 'react';
import Card from './Card';

export default function LargeTextInputCard({
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
      <textarea
        ref={textInputRef}
        className="large-text-input"
        placeholder={placeholder}
        onChange={(e) => inputState.setValue(e.target.value)}
        value={inputState.value}
        rows={3}
      ></textarea>
    </Card>
  );
}
