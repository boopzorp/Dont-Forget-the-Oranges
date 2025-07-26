import React from 'react';
import Image from 'next/image';

/**
 * This is the Logo component. To change the logo for your app,
 * you can edit this file.
 *
 * How to change the logo:
 * 1. Add your logo file (e.g., `logo.svg` or `logo.png`) to the `/public` directory.
 * 2. If it's an SVG, you can paste the SVG code directly into this file.
 * 3. Or, you can use the Next.js `Image` component like this (remember to import it):
 *    <Image src="/logo.png" alt="Your Company Logo" width={24} height={24} />
 *
 * The placeholder below is a simple SVG.
 */
export function Logo() {
  // Replace this placeholder with your own logo
  return (
    <svg
      role="img"
      aria-label="Logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );
}
