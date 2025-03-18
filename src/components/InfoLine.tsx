import { ElementType, ReactNode } from 'react';

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

function InfoItem({
  Icon,
  children,
}: {
  Icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="info-item">
      <Icon className="icon" />
      {children}
    </div>
  );
}
