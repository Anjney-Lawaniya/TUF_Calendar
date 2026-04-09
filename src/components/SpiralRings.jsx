import React from 'react';
import { clsx } from 'clsx';

export default function SpiralRings({ count = 12, className }) {
  // Generate the rings
  const rings = Array.from({ length: count });

  return (
    <div className={clsx("flex justify-evenly w-full px-8 absolute -top-4 left-0 z-20", className)}>
      {rings.map((_, i) => (
        <div key={i} className="relative w-4 h-10">
          {/* Hole punch */}
          <div className="absolute top-6 left-0 right-0 h-4 bg-zinc-900 rounded-full shadow-inner opacity-40"></div>
          {/* Wire ring */}
          <svg className="absolute top-0 left-[-4px] w-6 h-12" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 2C6.47715 2 2 6.47715 2 12V36C2 41.5228 6.47715 46 12 46C17.5228 46 22 41.5228 22 36V12C22 6.47715 17.5228 2 12 2Z" 
              stroke="url(#wireGradient)" 
              strokeWidth="4"
              style={{ filter: "drop-shadow(2px 4px 2px rgba(0,0,0,0.4))" }}
            />
            <defs>
              <linearGradient id="wireGradient" x1="0" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#e5e7eb" />
                <stop offset="0.5" stopColor="#9ca3af" />
                <stop offset="1" stopColor="#374151" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  );
}
