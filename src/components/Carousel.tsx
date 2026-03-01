'use client';

import { useRef } from 'react';
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
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      const scrollAmount = direction === 'left' ? -width : width;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
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
                cover
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
