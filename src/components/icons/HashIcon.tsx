import type { SVGProps } from 'react';

export default function HashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 9h14M5 15h14M11 4L7 20M17 4l-4 16"
      ></path>
    </svg>
  );
}
