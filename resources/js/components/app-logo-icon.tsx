import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 2L3 11.5V28.5L20 38L37 28.5V11.5L20 2ZM20 6.5L31.5 13L20 19.5L8.5 13L20 6.5ZM6 15.5L18 22.5V33.5L6 26.5V15.5ZM34 15.5V26.5L22 33.5V22.5L34 15.5Z"
      />
    </svg>
  );
}