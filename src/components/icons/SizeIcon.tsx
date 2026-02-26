import type { SVGProps } from 'react';

export default function SizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 4h4v4m-6 2l6-6M8 20H4v-4m0 4l6-6"
      ></path>
    </svg>
  );
}
