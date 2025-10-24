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
}

export function CheckinBlock({
  requiresPayment,
  participant,
  onUpdateSuccess,
  checkinButtonText = 'Check-in',
}: CheckinBlockProps) {
  const [payment, setPayment] = useState<PaymentMethods | null>(null);

  // API Call Check-in
  const handleCheckIn = async () => {
    const newRes = await checkInRegistration(participant.id);
    onUpdateSuccess(newRes);
  };

  // API Call Payment
  const handleMarkPayment = async () => {
    if (payment) {
      const newRes = await markPayment(participant.id, payment, false);
      onUpdateSuccess(newRes);
    }
  };

  return (
    <>
      {!requiresPayment || participant.payment !== null ? (
        participant.checked_in ? (
          <Card>
            <CheckCircleIcon className="icon" />
            Already checked in
          </Card>
        ) : (
          <>
            {requiresPayment && (
              <Card>
                <CheckCircleIcon className="icon" />
                Already paid by {formatPaymentMethod(participant.payment)}
              </Card>
            )}
            <button onClick={handleCheckIn}>{checkinButtonText}</button>
          </>
        )
      ) : (
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
      )}
    </>
  );
}
