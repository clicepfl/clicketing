import { CheckinBlock } from '@/components/CheckinBlock';
import Split from '@/components/Split';
import { Event, Registration } from '@/types/aliases';
import { DialogProps } from './CheckinDialog';

export interface SweaterCheckinDialogProps extends DialogProps {
  orders: { color?: string; size?: string }[];
}

export default function SweaterCheckinDialog({
  event,
  close,
  participant,
  updateParticipant,
  paymentOnlyDialog,
  orders,
}: SweaterCheckinDialogProps) {
  const totalPrice = event.price * orders.length;

  return (
    <>
      <Split>
        <b>{`${participant.first_name} ${participant.family_name}`}</b>
      </Split>

      <ul>
        {orders.map((order, index) => (
          <li key={index}>
            {order.color ?? 'Unknown color'} ({order.size ?? 'Unknown size'})
          </li>
        ))}
      </ul>

      <div className="total-price">
        <b>Price: {totalPrice}</b>
      </div>

      <CheckinBlock
        participant={participant}
        onUpdateSuccess={updateParticipant}
        requiresPayment={totalPrice > 0}
        paymentOnlyDialog={paymentOnlyDialog}
      />

      <button onClick={close}>Close</button>
    </>
  );
}

export function renderPaymentDialog(
  event: Event,
  participant: Registration,
  updateParticipant: (newRes: Registration) => void,
  close: () => void,
  orders: { color?: string; size?: string }[]
) {
  return (
    <SweaterCheckinDialog
      event={event}
      participant={participant}
      updateParticipant={updateParticipant}
      close={close}
      paymentOnlyDialog={true}
      orders={orders}
    />
  );
}
