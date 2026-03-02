import type { CSSProperties } from "react";

export function LanternIcon({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M12 2L10 4H14L12 2Z" fill="currentColor" opacity="0.8" />
      <path d="M9 4C8.44772 4 8 4.44772 8 5V6H16V5C16 4.44772 15.5523 4 15 4H9Z" fill="currentColor" />
      <path d="M7 7C7 6.44772 7.44772 6 8 6H16C16.5523 6 17 6.44772 17 7V15C17 15.5523 16.5523 16 16 16H8C7.44772 16 7 15.5523 7 15V7Z" fill="currentColor" opacity="0.9" />
      <path d="M8 8H16V14H8V8Z" fill="currentColor" opacity="0.3" />
      <path d="M10 16H14V18C14 19.1046 13.1046 20 12 20C10.8954 20 10 19.1046 10 18V16Z" fill="currentColor" opacity="0.8" />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
    </svg>
  );
}

export function CrescentIcon({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path
        d="M21 12.79C19.74 13.54 18.26 14 16.67 14C12.08 14 8.36 10.28 8.36 5.69C8.36 4.1 8.82 2.62 9.57 1.36C5.07 2.5 1.5 6.47 1.5 11.25C1.5 16.91 6.09 21.5 11.75 21.5C16.53 21.5 20.5 17.93 21.64 13.43L21 12.79Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StarIcon({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}
