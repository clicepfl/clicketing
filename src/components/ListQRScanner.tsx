import { QrcodeSuccessCallback } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import QrCodeScanner from './QrCodeScanner';
import TextInputCard from './TextInputCard';
import UserIcon from './icons/UserIcon';

export interface QRScannerSelectorEntry {
  value: string;
  searchValue: string;
  component: any;
}

export default function QRScannerSelector({
  items,
  onSelect,
  dialog,
}: {
  items: QRScannerSelectorEntry[];
  onSelect(value: string);
  dialog(value: string, close: () => void);
}) {
  const [selected, setSelected] = useState(null as string | null);
  const [filter, setFilter] = useState(null as string | null);
  const [filteredEntries, setFilteredEntries] = useState(
    [] as QRScannerSelectorEntry[]
  );

  useEffect(() => {
    if (filter === null || filter.length < 5) {
      setFilteredEntries([]);
      return;
    }

    setFilteredEntries(items.filter((i) => i.searchValue.includes(filter)));
  }, [filter, items]);

  useEffect(() => {
    if (selected !== null) {
      onSelect(selected);
    }
  }, [selected]);

  const onScanSuccess: QrcodeSuccessCallback = async (decodedText) => {
    if (
      selected !== decodedText &&
      items.some((i) => i.value === decodedText)
    ) {
      setSelected(decodedText);
    }
  };

  return (
    <div className="checkin">
      <QrCodeScanner
        qrCodeSuccessCallback={onScanSuccess}
        fps={10}
        qrbox={{ width: 250, height: 250 }}
      />
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
