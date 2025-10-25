import { formatPaymentMethod, PaymentMethods } from '@/actions/common-client';
import { checkInRegistration, markPayment } from '@/actions/common-server';
import Card from '@/components/Card';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import { Registration } from '@/types/aliases';
import { useState } from 'react';
import DropdownCard from './DropdownCard';
import PriceIcon from './icons/PriceIcon';

interface CheckinBlockProps {
  requiresPayment: boolean;
  participant: Registration;
  onUpdateSuccess: (newRes: Registration) => void;
  checkinButtonText?: string;
  paymentOnlyDialog?: boolean;
}

export function CheckinBlock({
  requiresPayment,
  participant,
  onUpdateSuccess,
  paymentOnlyDialog = false, // If true, only show payment marking UI
  checkinButtonText = 'Check-in',
}: CheckinBlockProps) {
  // If payment page, send confirmation email after marking payment
  // else, don't (payement at check-in)
  const sendConfirmationEmail = paymentOnlyDialog;
  const [payment, setPayment] = useState<PaymentMethods | null>(null);

  // API Call Check-in
  const handleCheckIn = async () => {
    const newRes = await checkInRegistration(participant.id);
    onUpdateSuccess(newRes);
  };

  // API Call Payment
  const handleMarkPayment = async () => {
    if (payment) {
      const newRes = await markPayment(
        participant.id,
        payment,
        sendConfirmationEmail
      );
      onUpdateSuccess(newRes);
    }
  };

  // Payment required and not yet paid
  if (requiresPayment && participant.payment === null) {
    return (
      <>
        <Card>Payment has not been made</Card>
        <DropdownCard
          Icon={PriceIcon}
          placeholder={'Payment method'}
          options={Object.values(PaymentMethods).map((v) => ({
            display: formatPaymentMethod(v),
            value: v,
          }))}
          dropdownState={{
            value: payment,
            setValue: setPayment,
          }}
        />
        <button onClick={handleMarkPayment} disabled={payment === null}>
          Save Payment
        </button>
      </>
    );
  }

  const showStatus = requiresPayment || participant.checked_in;
  const showCheckinButton = !paymentOnlyDialog && !participant.checked_in;

  return (
    <>
      {showStatus && (
        <Card>
          <CheckCircleIcon className="icon" />
          {requiresPayment && participant.payment !== null
            ? participant.checked_in
              ? 'Already paid & checked in'
              : `Already paid by ${formatPaymentMethod(participant.payment)}`
            : 'Already checked in'}
        </Card>
      )}
      {showCheckinButton && (
        <button onClick={handleCheckIn}>{checkinButtonText}</button>
      )}
    </>
  );
}
