import type { SVGProps } from 'react';

export default function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0m9-3h.01"></path>
        <path d="M11 12h1v4h1"></path>
      </g>
    </svg>
  );
}
