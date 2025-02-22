import Card from './Card';
import ErrorIcon from './icons/ErrorIcon';

export type ParticipantInfos = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  checkedIn: boolean;
  depositMade: boolean;
};

export type DialogValues =
  | ({ status: DialogType.SUCCESS } & ParticipantInfos)
  | ({ status: DialogType.WARNING; warning: string } & ParticipantInfos)
  | { status: DialogType.ERROR; error?: string };

export enum DialogType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export function Dialog({
  values,
  setValues,
}: {
  values: DialogValues | null;
  setValues: (values: DialogValues | null) => void;
}) {
  if (values !== null) {
    const dialogSections = (() => {
      switch (values.status) {
        case DialogType.SUCCESS:
          return (
            <>
              <Card>
                <b>
                  {values.firstName} {values.lastName}
                </b>
              </Card>
              <Card>{values.email}</Card>
            </>
          );
        case DialogType.WARNING:
          return (
            <>
              <Card Icon={ErrorIcon}>{values.warning}</Card>
              <Card>
                {values.firstName} {values.lastName}
              </Card>
              <Card>{values.email}</Card>
            </>
          );
        case DialogType.ERROR:
          return (
            <>
              {values.error ? (
                <Card Icon={ErrorIcon}>{values.error}</Card>
              ) : (
                <Card Icon={ErrorIcon}>An unknown error occurred</Card>
              )}
            </>
          );
      }
    })();

    return (
      <div className="dialog">
        <div className={`dialog-inner`}>
          {dialogSections}
          <button onClick={() => setValues(null)}>Close</button>
          <button onClick={() => {}}>Check in</button>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
