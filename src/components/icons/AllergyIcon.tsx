import type { SVGProps } from 'react';

export default function AllergyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <path d="M8.868 8.846C6.112 12.228 3 21 3 21s8.75-3.104 12.134-5.85m1.667-2.342a4.486 4.486 0 0 0-5.589-5.615M9 13l-1.5-1.5"></path>
        <path d="M22 8s-1.14-2-3-2c-1.406 0-3 2-3 2s1.14 2 3 2s3-2 3-2"></path>
        <path d="M16 2s-2 1.14-2 3s2 3 2 3s2-1.577 2-3c0-1.86-2-3-2-3M3 3l18 18"></path>
      </g>
    </svg>
  );
}
