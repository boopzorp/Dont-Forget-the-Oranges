import React from 'react';
import Image from 'next/image';

/**
 * This is the Logo component. To change the logo for your app,
 * you can edit this file.
 *
 * How to change the logo:
 * 1. Add your logo file (e.g., `logo.png`) to the `/public` directory at the root of your project.
 * 2. Update the `src` prop in the `Image` component below to point to your file (e.g., `src="/your-logo.svg"`).
 *
 * The component is currently set up to display `logo.png` from the `public` folder.
 */
export function Logo() {
  return (
    <Image 
      src="/logo.png"
      alt="Don't Forget the Oranges Logo"
      width={32}
      height={32}
      className="h-8 w-8"
    />
  );
}
