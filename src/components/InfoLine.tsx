import { ElementType, ReactNode } from 'react';
import InfoItem from './InfoItem';

// (Icon, content): (ElementType, ReactNode);

export default function InfoLine({
  infoItems,
}: {
  infoItems: [ElementType, ReactNode][];
}) {
  return (
    <div className="info-line">
      {infoItems.map((infoItem, index) => (
        <InfoItem Icon={infoItem[0]} key={index}>
          {infoItem[1]}
        </InfoItem>
      ))}
    </div>
  );
}
