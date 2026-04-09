import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import HeroImage from './HeroImage';
import SpiralRings from './SpiralRings';

export default function CalendarGrid({
  currentDate,
  grid,
  mNext,
  mPrev,
  handleDateClick,
  handleDateHover,
  startDate,
  endDate,
  hoverDate,
  openDrawer,
  isDrawerOpen,
  returnToToday,
  isCurrentMonthView,
  activeTheme,
  activeGlow,
  activeBorder
}) {
  const containerRef = useRef(null);
  const gridWrapRef = useRef(null);
  
  const tooltipRef = useRef(null);
  const [tooltipData, setTooltipData] = useState({ show: false, x: 0, y: 0, label: '' });

  const monthName = format(currentDate, 'MMMM');
  const mIndex = currentDate.getMonth();

  useEffect(() => {
    if (tooltipData.show && tooltipRef.current) {
      gsap.to(tooltipRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: "back.out(1.5)" });
    } else if (tooltipRef.current) {
      gsap.to(tooltipRef.current, { autoAlpha: 0, y: 5, scale: 0.95, duration: 0.2 });
    }
  }, [tooltipData.show]);

  const onCellHover = (e, cell) => {
    if (cell.isCurrentMonth) {
      gsap.to(e.currentTarget, { scale: 1.1, zIndex: 20, duration: 0.2, ease: "back.out(1.5)" });
      handleDateHover(cell.date);
      if (cell.eventLabel) {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipData({ show: true, x: rect.left + rect.width / 2, y: rect.top - 10, label: cell.eventLabel });
      }
    }
  };

  const onCellLeave = (e, cell) => {
    gsap.to(e.currentTarget, { scale: 1, zIndex: 1, duration: 0.2, ease: "power2.out" });
    if (cell.eventLabel) {
      setTooltipData(prev => ({ ...prev, show: false }));
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative z-10 perspective-1000">
      
      {/* LEFT COLUMN: Visual Anchor */}
      <div className="w-full md:w-5/12 h-[35vh] md:h-auto md:flex-1 relative flex flex-col border-b md:border-b-0 md:border-r border-white/20">
        <HeroImage 
          monthName={monthName} 
          monthIndex={mIndex} 
          className="absolute inset-0 w-full h-full z-0 object-cover" 
        />
        
        {/* Gradients to fade nicely against images */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-transparent to-indigo-950/80 z-10 pointer-events-none"></div>

        <div className="relative z-20 flex flex-col justify-between h-full p-6 md:p-8">
          
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-heading font-black flex items-center justify-between w-full">
              <button onClick={mPrev} className="p-2 sm:p-3 bg-white/20 hover:bg-white/40 rounded-full shadow-sm transition-all active:scale-95 text-white backdrop-blur-md border border-white/30">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <span className={clsx("text-center text-transparent bg-clip-text drop-shadow-sm bg-gradient-to-r leading-tight uppercase font-black", activeTheme)}>
                {monthName}<br className="hidden md:block"/> <span className="text-white text-xl md:text-3xl lg:text-4xl">{format(currentDate, 'yyyy')}</span>
              </span>

              <button onClick={mNext} className="p-2 sm:p-3 bg-white/20 hover:bg-white/40 rounded-full shadow-sm transition-all active:scale-95 text-white backdrop-blur-md border border-white/30">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </h3>
            
            {startDate && (
              <div className="text-sm rounded-xl font-semibold text-white/90 bg-black/40 px-4 py-2 border border-white/20 backdrop-blur-md shadow-sm self-center text-center">
                Selected: {format(startDate, 'MMM d')} {endDate && `- ${format(endDate, 'MMM d')}`}
              </div>
            )}
          </div>

          {!isCurrentMonthView && (
            <div className="self-center mt-auto pb-2 z-50">
              <button 
                onClick={returnToToday} 
                className="backdrop-blur-xl bg-white/20 hover:bg-white/40 shadow-xl border border-white/50 text-white font-black px-6 py-2 md:py-3 md:px-8 rounded-full transition-all active:scale-95 drop-shadow-lg flex items-center justify-center gap-2"
              >
                <div className={clsx("w-2 h-2 rounded-full bg-gradient-to-r", activeTheme)}></div>
                Back to {format(new Date(), 'MMM d')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Mathematical Grid */}
      <div className="w-full md:w-7/12 flex flex-col p-4 sm:p-6 md:p-8 h-[55vh] md:h-auto md:flex-1 bg-white/40 backdrop-blur-3xl relative">
        <SpiralRings count={9} className="hidden md:flex top-[-16px]" />
        
        <div className="transform-style-3d backface-hidden flex flex-col flex-1 pb-10" ref={gridWrapRef}>
          
          <div className="grid grid-cols-7 gap-0 mb-2">
            {weekdays.map(d => (
              <div key={d} className="text-center text-xs tracking-widest font-black uppercase text-indigo-950/50 drop-shadow-sm pb-2 border-b border-indigo-950/10">
                {d.charAt(0)}<span className="hidden sm:inline">{d.slice(1)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-[repeat(6,minmax(0,1fr))] gap-0 flex-1 w-full relative" ref={containerRef} onMouseLeave={() => handleDateHover(null)}>
            {grid.map((row, i) => (
              row.map((cell, j) => {
                const isStartEnd = cell.isStart || cell.isEnd;
                 
                return (
                  <div 
                    key={`${i}-${j}`} 
                    className="relative flex items-center justify-center select-none group w-full h-full"
                  >
                    {/* Continuous highlighter stroke matching exact cell limits dynamically */}
                    {cell.inRange && cell.isCurrentMonth && (
                      <div className={clsx("absolute inset-y-1 inset-x-0 opacity-40 backdrop-blur-sm z-0 bg-gradient-to-r", activeTheme)}></div>
                    )}
                    {cell.isStart && (endDate || hoverDate) && cell.isCurrentMonth && (
                      <div className={clsx("absolute inset-y-1 left-1/2 right-0 opacity-40 backdrop-blur-sm z-0 bg-gradient-to-r", activeTheme)}></div>
                    )}
                    {cell.isEnd && startDate && cell.isCurrentMonth && (
                      <div className={clsx("absolute inset-y-1 right-1/2 left-0 opacity-40 backdrop-blur-sm z-0 bg-gradient-to-r", activeTheme)}></div>
                    )}

                    {/* Today Context Dynamic Color */}
                    {cell.isToday && (
                      <div 
                        className={clsx("absolute inset-2 sm:inset-3 rounded-full border-2 opacity-90 animate-glow-pulse pointer-events-none z-0 mix-blend-overlay", activeBorder)}
                        style={{ boxShadow: `0 0 15px ${activeGlow}` }}
                      ></div>
                    )}

                    <button
                      onClick={() => cell.isCurrentMonth && handleDateClick(cell.date)}
                      onMouseEnter={(e) => onCellHover(e, cell)}
                      onMouseLeave={(e) => onCellLeave(e, cell)}
                      disabled={!cell.isCurrentMonth}
                      className={clsx(
                        "relative flex items-center justify-center rounded-full leading-none transition-all z-10 font-bold",
                        "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sm sm:text-base lg:text-lg mx-auto",
                        cell.isCurrentMonth ? "cursor-pointer text-indigo-950" : "text-indigo-950/20 bg-transparent",
                        isStartEnd && `bg-gradient-to-br ${activeTheme} text-white shadow-[0_4px_14px_rgba(0,0,0,0.2)] border border-white/50`,
                        (!isStartEnd && cell.isCurrentMonth && !cell.inRange && !cell.isToday) && "hover:bg-white/60 hover:shadow-sm border border-transparent hover:border-white/40",
                        cell.inRange && !isStartEnd && "text-white drop-shadow-md",
                        cell.isToday && !isStartEnd && `text-white font-black bg-gradient-to-r ${activeTheme} shadow-md border ${activeBorder}`,
                        cell.isFocused && "ring-2 ring-white ring-offset-2 ring-offset-transparent shadow-[0_0_15px_rgba(255,255,255,0.7)]"
                      )}
                    >
                      {format(cell.date, 'd')}
                      
                      {cell.eventLabel && cell.isCurrentMonth && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm border border-indigo-200"></div>
                      )}
                    </button>
                  </div>
                );
              })
            ))}

            {/* Note Drawer FAB anchor */}
            {!isDrawerOpen && (
              <div className="absolute right-0 -bottom-8 lg:-bottom-6 z-50">
                 <button 
                    onClick={openDrawer} 
                    className={clsx("flex items-center gap-2 text-white px-4 py-2 rounded-full shadow-lg transition-all active:scale-95 group border border-white/20 bg-gradient-to-r", activeTheme)}
                    style={{ boxShadow: `0 4px 14px 0 ${activeGlow}` }}
                  >
                    <PenLine size={16} />
                    <span className="text-sm font-semibold pr-1">Notes</span>
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    {/* Global TSAP Event Tooltip */}
    <div 
      ref={tooltipRef}
      className={clsx(
        "fixed pointer-events-none px-4 py-2 bg-white/80 backdrop-blur-xl text-indigo-950 text-sm font-bold tracking-tight rounded-xl border border-white/50 shadow-2xl translate-x-[-50%] translate-y-[-100%] z-[100] opacity-0 invisible",
      )}
      style={{ left: tooltipData.x, top: tooltipData.y }}
    >
      <div className={clsx("absolute inset-0 rounded-xl opacity-20 bg-gradient-to-r", activeTheme)}></div>
      <span className="relative z-10 drop-shadow-sm">{tooltipData.label}</span>
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/80 backdrop-blur-xl border-b border-r border-white/50 rotate-45"></div>
    </div>
    </div>
  );
}
