export default function Checkbox({
  setChecked,
  checked,
}: {
  setChecked: (checked: boolean) => void;
  checked: boolean;
}) {
  return (
    <div className="icon">
      <input
        type="checkbox"
        className="checkbox"
        checked={checked}
        onChange={() => {
          setChecked(!checked);
        }}
      ></input>
    </div>
  );
}
