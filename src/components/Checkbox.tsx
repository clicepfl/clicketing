import CheckMarkIcon from './icons/CheckMarkIcon';

export default function Checkbox({
  setChecked,
  checked,
}: {
  setChecked: (checked: boolean) => void;
  checked: boolean;
}) {
  return (
    <div className="icon">
      <div className={`checkbox ${checked ? 'checked' : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            setChecked(!checked);
          }}
        ></input>
        {checked && <CheckMarkIcon className="icon checkmark" />}
      </div>
    </div>
  );
}
