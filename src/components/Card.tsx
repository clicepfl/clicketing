import { ElementType, ReactNode } from 'react';

export default function Card({
  Icon,
  children,
  selectable = false,
  onClick,
}: {
  Icon: ElementType;
  children: ReactNode;
  selectable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className={`card ${selectable ? 'selectable' : ''}`} onClick={onClick}>
      <Icon className="icon" />
      {children}
    </div>
  );
}
