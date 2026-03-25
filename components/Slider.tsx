// components/Slider.tsx
"use client";

import Image from "next/image";

interface SlideItem {
  image: string;
  title: string;
}

interface SliderProps {
  items: SlideItem[];
  speed?: number; // seconds for one loop
}

export default function Slider({ items, speed = 30 }: SliderProps) {
  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Fade overlays — match page background, not pure white */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background via-background/80 to-transparent sm:w-24 md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background via-background/80 to-transparent sm:w-24 md:w-32" />
      {/* Slider track */}
      <div className="flex py-2">
        <div
          className="flex animate-slide"
          style={{
            animationDuration: `${speed}s`,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex h-24 w-44 flex-shrink-0 flex-col items-center justify-center sm:h-28 sm:w-52 md:h-32 md:w-64"
            >
              <div className="relative h-16 w-36 sm:h-20 sm:w-44 md:h-24 md:w-52">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 640px) 9rem, (max-width: 768px) 11rem, 13rem"
                />
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex animate-slide"
          style={{
            animationDuration: `${speed}s`,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex h-24 w-44 flex-shrink-0 flex-col items-center justify-center sm:h-28 sm:w-52 md:h-32 md:w-64"
            >
              <div className="relative h-16 w-36 sm:h-20 sm:w-44 md:h-24 md:w-52">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 640px) 9rem, (max-width: 768px) 11rem, 13rem"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-slide {
          animation: slide linear infinite;
        }
      `}</style>
    </div>
  );
}
