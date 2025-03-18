import { useEffect, useState } from 'react';
import TextInputCard from './TextInputCard';
import UserIcon from './icons/UserIcon';

export interface SearchSelectorEntry {
  value: string;
  searchValue: string;
  component: any;
}

export default function SearchSelector({
  items,
  onSelect,
  dialog,
}: {
  items: SearchSelectorEntry[];
  onSelect(value: string);
  dialog(value: string, close: () => void);
}) {
  const [selected, setSelected] = useState(null as string | null);
  const [filter, setFilter] = useState('');
  const [filteredEntries, setFilteredEntries] = useState(
    [] as SearchSelectorEntry[]
  );

  useEffect(() => {
    if (filter.length < 1) {
      setFilteredEntries([]);
      return;
    }

    setFilteredEntries(
      items.filter((i) => i.searchValue.includes(filter)).slice(0, 5)
    );
  }, [filter, items]);

  useEffect(() => {
    if (selected !== null) {
      onSelect(selected);
    }
  }, [selected]);

  return (
    <div className="selector">
      {selected != null ? (
        <div className="dialog">
          <div className="dialog-inner">
            {dialog(selected, () => setSelected(null))}
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="search">
        <TextInputCard
          Icon={UserIcon}
          placeholder="Search"
          inputState={{ value: filter, setValue: setFilter }}
        ></TextInputCard>
        <div className="search-results">
          {filteredEntries.map((p) => (
            <div onClick={() => setSelected(p.value)}>{p.component}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
