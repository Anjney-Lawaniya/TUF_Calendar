import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { MONTH_IMAGES } from '../App';

export default function HeroImage({ monthName, monthIndex, className }) {
  const containerRef = useRef(null);
  
  const [images, setImages] = useState({
    curr: MONTH_IMAGES[monthIndex] || MONTH_IMAGES[0],
    prev: null
  });

  const currImgRef = useRef(null);
  const prevImgRef = useRef(null);

  useEffect(() => {
    const nextImg = MONTH_IMAGES[monthIndex] || MONTH_IMAGES[0];
    if (images.curr !== nextImg) {
      setImages({ prev: images.curr, curr: nextImg });
    }
  }, [monthIndex, images.curr]);

  useEffect(() => {
    if (images.prev) {
      gsap.fromTo(prevImgRef.current, { opacity: 1 }, { opacity: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.fromTo(currImgRef.current, { opacity: 0 }, { 
        opacity: 1, 
        duration: 0.8, 
        ease: 'power2.inOut',
        onComplete: () => {
          setImages(prev => ({ ...prev, prev: null }));
        }
      });
    }
  }, [images.prev]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      const items = [currImgRef.current, prevImgRef.current].filter(Boolean);
      
      gsap.to(items, {
        x: x * -40,
        y: y * -40,
        scale: 1.1,
        duration: 1,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      const items = [currImgRef.current, prevImgRef.current].filter(Boolean);
      gsap.to(items, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.5,
        ease: 'power2.out',
      });
    };

    const cRef = containerRef.current;
    if (cRef) {
      cRef.addEventListener('mousemove', handleMouseMove);
      cRef.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (cRef) {
        cRef.removeEventListener('mousemove', handleMouseMove);
        cRef.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={className || "w-full h-56 md:h-72 lg:h-80 overflow-hidden relative rounded-t-3xl border-b border-white/20 z-10"}
    >
      <div className="absolute inset-[-40px]">
        {images.prev && (
          <div 
            ref={prevImgRef}
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url('${images.prev}')` }}
          />
        )}
        <div 
          ref={currImgRef}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url('${images.curr}')` }}
        />
      </div>

      {/* Vibrant, non-funeral Gradient Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/60 via-transparent to-white/20 z-30 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/40 z-30 pointer-events-none"></div>
    </div>
  );
}
