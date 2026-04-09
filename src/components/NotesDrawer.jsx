import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { PenLine, Trash2, X, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import gsap from 'gsap';

export default function NotesDrawer({ 
  isOpen, 
  closeDrawer,
  startDate, 
  endDate, 
  getDayNotes, 
  saveNoteToRange, 
  deleteNote,
  activeTheme
}) {
  const [text, setText] = useState('');
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
    } else {
      gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
    }
  }, [isOpen]);

  useEffect(() => {
    setText('');
  }, [startDate, isOpen]);

  const handleAdd = () => {
    if (text.trim() && startDate) {
      saveNoteToRange(startDate, endDate, text.trim());
      setText('');
    }
  };

  const headerText = startDate 
    ? (endDate 
        ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
        : format(startDate, 'do MMMM'))
    : 'Select a Date';

  const notesList = startDate ? getDayNotes(startDate) : [];

  return (
    <>
      <div 
        ref={overlayRef}
        onClick={closeDrawer}
        className="fixed inset-0 bg-indigo-950/20 backdrop-blur-[2px] z-60 invisible opacity-0"
      ></div>

      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white/60 backdrop-blur-3xl shadow-2xl border-l border-white/40 z-70 flex flex-col translate-x-full"
      >
        <div className="p-6 border-b border-indigo-900/10 flex justify-between items-center bg-white/40 shadow-sm relative z-10 w-full">
          <h3 className={clsx("font-heading font-black text-transparent bg-clip-text text-xl flex items-center gap-2 drop-shadow-sm bg-gradient-to-r", activeTheme)}>
            <PenLine size={20} className="text-indigo-900" />
            {headerText}
          </h3>
          <button 
            onClick={closeDrawer}
            className="p-2 text-indigo-950/40 hover:text-indigo-950 hover:bg-white/60 hover:shadow-sm rounded-full transition-all"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 w-full overflow-y-auto space-y-4">
          {notesList.length === 0 ? (
            <div className="text-center text-indigo-950/40 italic py-10 font-medium">No notes for this date.</div>
          ) : (
            notesList.map((n, i) => (
              <div key={i} className="flex justify-between items-start p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm group hover:shadow-md transition-all">
                <p className="text-indigo-950 font-medium break-words flex-1 leading-snug">{n}</p>
                <button 
                  onClick={() => deleteNote(startDate, i)}
                  className="p-2 opacity-0 md:opacity-0 md:group-hover:opacity-100 opacity-100 text-indigo-950/30 hover:text-red-500 hover:bg-white/60 rounded-full transition-all ml-2 flex-shrink-0"
                  title="Delete note"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-white/40 border-t border-indigo-900/10 backdrop-blur-md">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add a new note..."
              className="flex-1 bg-white/60 border border-white/50 rounded-full px-5 py-3 text-indigo-950 placeholder-indigo-950/40 outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white shadow-inner transition-all font-medium"
            />
            <button 
              onClick={handleAdd}
              disabled={!text.trim()}
              className={clsx("p-3 rounded-full text-white shadow-md transition-all flex items-center justify-center disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed", text.trim() ? "hover:scale-105 active:scale-95 bg-gradient-to-r" : "bg-indigo-300", text.trim() ? activeTheme : "")}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
