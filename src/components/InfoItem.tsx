import { ElementType, ReactNode } from 'react';

export default function InfoItem({
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
