"use client";

import { useState, useRef, useEffect } from "react";
import type { ListingImage } from "@prisma/client";

interface ImageGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle scroll to update dot indicator
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setCurrentIndex(index);
    };

    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 lg:rounded-3xl">
        <div className="flex h-full w-full items-center justify-center text-slate-400">
          No image
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Main gallery with scroll snap */}
      <div
        ref={scrollRef}
        className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto rounded-2xl bg-slate-100 scrollbar-hide lg:rounded-3xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="aspect-square min-w-full snap-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={index === 0 ? title : `${title} - Image ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: index * scrollRef.current.offsetWidth,
                    behavior: 'smooth',
                  });
                }
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-slate-900'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
