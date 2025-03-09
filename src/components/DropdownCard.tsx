import { ElementType, useState } from 'react';
import Card from './Card';
import OutsideAlerter from './OutsideAlerter';
import Split from './Split';
import ChevronIcon from './icons/ChevronIcon';

export default function DropdownCard({
  Icon,
  placeholder,
  options,
  dropdownState,
}: {
  Icon: ElementType;
  placeholder: string;
  options: { value: string; display: string }[];
  dropdownState: {
    value: string | null;
    setValue: (value: string) => void;
  };
}) {
  const [stayOpen, setStayOpen] = useState(false);

  return (
    <div className={`dropdown ${stayOpen ? 'open' : ''}`}>
      <OutsideAlerter handleClickOutside={() => setStayOpen(false)}>
        <Card
          Icon={Icon}
          selectable={true}
          onClick={() => setStayOpen(!stayOpen)}
        >
          <Split>
            {dropdownState.value !== null
              ? options.find((o) => o.value === dropdownState.value).display
              : placeholder}
            <ChevronIcon className="icon" />
          </Split>
        </Card>
      </OutsideAlerter>
      <div className="dropdown-content">
        {options.map((e) => (
          <div
            className="dropdown-item"
            key={e.value}
            onClick={() => {
              dropdownState.setValue(e.value);
              setStayOpen(false);
            }}
          >
            {e.display}
          </div>
        ))}
      </div>
    </div>
  );
}
