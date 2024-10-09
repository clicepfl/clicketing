import { ElementType, ReactNode } from 'react';

export default function Card({
  Icon,
  children,
}: {
  Icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="card">
      <Icon className="icon" />
      {children}
    </div>
  );
}
