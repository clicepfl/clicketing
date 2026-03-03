'use client';

import { useRef, useState } from 'react';
import DirectusImage from './DirectusImage';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

export type CarouselImage = {
  src: string;
  caption: string;
};

export default function Carousel({
  images,
}: {
  images: { src: string; caption: string }[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [, setCurrentIndex] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    if (images.length === 0) return;

    setCurrentIndex((prevIndex) => {
      const newIndex =
        direction === 'right'
          ? (prevIndex + 1) % images.length
          : (prevIndex - 1 + images.length) % images.length;

      if (scrollRef.current) {
        const width = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({
          left: newIndex * width,
          behavior: 'smooth',
        });
      }

      return newIndex;
    });
  };

  return (
    <div className="carousel-viewport">
      <div className="carousel-container" ref={scrollRef}>
        {images.map((img, i) => (
          <div key={i} className="carousel-slide">
            <div className="carousel-image-wrapper">
              <DirectusImage
                img={img.src}
                name={img.caption}
                className="carousel-image"
                loading="lazy"
              />
            </div>
            <p className="carousel-caption">{img.caption}</p>
          </div>
        ))}
      </div>

      <div className="carousel-nav">
        <button className="carousel-prev" onClick={() => handleScroll('left')}>
          <ChevronLeftIcon className="icon" />
        </button>
        <button className="carousel-next" onClick={() => handleScroll('right')}>
          <ChevronRightIcon className="icon" />
        </button>
      </div>
    </div>
  );
}
