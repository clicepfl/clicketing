import { ElementType, ReactNode } from 'react';

export default function Card({
  Icon,
  children,
  selectable = false,
  onClick,
  iconProps,
}: {
  Icon?: ElementType;
  children: ReactNode;
  selectable?: boolean;
  onClick?: () => void;
  iconProps?: any;
}) {
  return (
    <div className={`card ${selectable ? 'selectable' : ''}`} onClick={onClick}>
      {Icon && <Icon className="icon" {...iconProps} />}
      {children}
    </div>
  );
}
