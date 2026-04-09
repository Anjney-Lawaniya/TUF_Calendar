import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import gsap from 'gsap';
import { useCalendarGrid } from './hooks/useCalendarGrid';
import SeasonalParticles from './components/SeasonalParticles';
import SpiralRings from './components/SpiralRings';
import HeroImage from './components/HeroImage';
import CalendarGrid from './components/CalendarGrid';
import NotesDrawer from './components/NotesDrawer';

export const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1478719059408-592965723cbc?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1588614959060-4d144f28b207?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1533324268742-60b2f137caa1?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1465188162913-8fb5709d6d57?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1444459094717-a39f1e3e0903?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1508244033908-111005a766c1?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=1000&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=1000&auto=format&fit=crop"  
];

// Explicit complete strings for Tailwind Purge
export const getSeasonalTheme = (mIndex) => {
  if (mIndex >= 2 && mIndex <= 4) return "from-pink-400 to-rose-400";
  if (mIndex >= 5 && mIndex <= 7) return "from-amber-400 to-orange-500";
  if (mIndex >= 8 && mIndex <= 10) return "from-orange-600 to-red-700";
  return "from-blue-400 to-cyan-300";
};

// Also export glow colors for the Today drop shadow
export const getSeasonalGlow = (mIndex) => {
  if (mIndex >= 2 && mIndex <= 4) return "rgba(244,114,182,0.8)"; // pink-400
  if (mIndex >= 5 && mIndex <= 7) return "rgba(251,191,36,0.8)"; // amber-400
  if (mIndex >= 8 && mIndex <= 10) return "rgba(234,88,12,0.8)"; // orange-600
  return "rgba(96,165,250,0.8)"; // blue-400
};

export const getSeasonalBorder = (mIndex) => {
  if (mIndex >= 2 && mIndex <= 4) return "border-pink-400";
  if (mIndex >= 5 && mIndex <= 7) return "border-amber-400";
  if (mIndex >= 8 && mIndex <= 10) return "border-orange-600";
  return "border-blue-400";
};

function App() {
  const calState = useCalendarGrid(new Date());
  const monthName = format(calState.currentDate, 'MMMM');
  const mIndex = calState.currentDate.getMonth();
  
  const activeTheme = getSeasonalTheme(mIndex);
  const activeGlow = getSeasonalGlow(mIndex);
  const activeBorder = getSeasonalBorder(mIndex);

  const [bgImgs, setBgImgs] = useState({
    curr: MONTH_IMAGES[mIndex] || MONTH_IMAGES[0],
    prev: null
  });

  const currBgRef = useRef(null);
  const prevBgRef = useRef(null);
  const calendarCardRef = useRef(null);
  const containerRef = useRef(null);
  const prevDateRef = useRef(calState.currentDate);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !calendarCardRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPercent = (x / rect.width - 0.5) * 2; 
    const yPercent = (y / rect.height - 0.5) * 2;

    gsap.to(calendarCardRef.current, {
      rotateX: -yPercent * 10,
      rotateY: xPercent * 10,
      transformOrigin: "center center",
      duration: 0.6,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    if (!calendarCardRef.current) return;
    gsap.to(calendarCardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.4)"
    });
  };

  useEffect(() => {
    if (prevDateRef.current.getTime() !== calState.currentDate.getTime()) {
      const isNext = calState.currentDate > prevDateRef.current;
      gsap.fromTo(calendarCardRef.current,
        {
           rotateY: isNext ? 30 : -30,
           transformOrigin: isNext ? "right center" : "left center",
           opacity: 0.7,
           transformStyle: "preserve-3d"
        },
        {
           rotateY: 0,
           opacity: 1,
           duration: 1.2,
           ease: "power3.out"
        }
      );
      prevDateRef.current = calState.currentDate;
    }
  }, [calState.currentDate]);

  useEffect(() => {
    const nextImg = MONTH_IMAGES[mIndex] || MONTH_IMAGES[0];
    if (bgImgs.curr !== nextImg) {
      setBgImgs({ prev: bgImgs.curr, curr: nextImg });
    }
  }, [mIndex, bgImgs.curr]);

  useEffect(() => {
    if (bgImgs.prev) {
      gsap.fromTo(prevBgRef.current, { opacity: 1 }, { opacity: 0, duration: 1.2, ease: 'power2.inOut' });
      gsap.fromTo(currBgRef.current, { opacity: 0 }, { 
        opacity: 1, 
        duration: 1.2, 
        ease: 'power2.inOut',
        onComplete: () => {
          setBgImgs(prev => ({ ...prev, prev: null }));
        }
      });
    }
  }, [bgImgs.prev]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-cover bg-center flex items-center justify-center p-4 md:p-8 relative">
      
      {/* Global Background Layer */}
      <div className="fixed inset-0 z-0 bg-black">
        {bgImgs.prev && (
          <div 
            ref={prevBgRef}
            className="absolute inset-0 bg-cover bg-center will-change-transform scale-105 filter blur-sm"
            style={{ backgroundImage: `url('${bgImgs.prev}')` }}
          />
        )}
        <div 
          ref={currBgRef}
          className="absolute inset-0 bg-cover bg-center will-change-transform scale-105 filter blur-sm"
          style={{ backgroundImage: `url('${bgImgs.curr}')` }}
        />
        {/* Soft, colorful CSS gradient overlay to ensure readability and vibrancy */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-800/40 to-pink-900/50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
      </div>

      {/* Full-Screen Seasonal Particle Engine (Unbound!) */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <SeasonalParticles monthName={monthName} isFullScreen={true} />
      </div>
      
      {/* Centered Glassmorphic App Core vertically stacked for scaling bounding boxes */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-5xl max-h-[90vh] relative z-20 flex flex-col pt-0 transition-all duration-700 ease-out hover:scale-[1.02] hover:-translate-y-3 perspective-[2000px] cursor-default"
      >
        
        {/* Glassmorphic Calendar Body Constrained Frame */}
        <div 
          ref={calendarCardRef}
          className="relative rounded-3xl bg-white/60 backdrop-blur-3xl border border-white/40 ring-1 ring-white/30 flex flex-col max-h-[90vh] min-h-0 overflow-hidden"
          style={{ boxShadow: `0 25px 50px -12px ${activeGlow}, 0 0 20px -5px ${activeGlow}` }}
        >
          <SpiralRings count={8} className="md:hidden flex" />
          
          <div className="flex flex-col relative z-10 flex-1 h-full min-h-0">
            <CalendarGrid 
              {...calState} 
              activeTheme={activeTheme} 
              activeGlow={activeGlow}
              activeBorder={activeBorder}
            />
          </div>
        </div>

      </div>

      <NotesDrawer 
        isOpen={calState.isDrawerOpen}
        closeDrawer={calState.closeDrawer}
        startDate={calState.startDate}
        endDate={calState.endDate}
        getDayNotes={calState.getDayNotes}
        saveNoteToRange={calState.saveNoteToRange}
        deleteNote={calState.deleteNote}
        activeTheme={activeTheme}
      />
    </div>
  );
}

export default App;
