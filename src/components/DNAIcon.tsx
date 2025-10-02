import React from 'react';

interface DNAIconProps {
  className?: string;
}

export function DNAIcon({ className = "w-6 h-6" }: DNAIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8" r="1" fill="currentColor" />
      <circle cx="14" cy="8" r="1" fill="currentColor" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
      <circle cx="14" cy="12" r="1" fill="currentColor" />
      <circle cx="10" cy="16" r="1" fill="currentColor" />
      <circle cx="14" cy="16" r="1" fill="currentColor" />
      <path
        d="M10 8L14 8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M10 12L14 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M10 16L14 16"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}