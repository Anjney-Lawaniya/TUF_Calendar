import { useState, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  addDays
} from 'date-fns';

export function useCalendarGrid(initialDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const returnToToday = () => setCurrentDate(new Date());
  const isCurrentMonthView = isSameMonth(currentDate, new Date());
  
  const [focusedDate, setFocusedDate] = useState(new Date());

  const MOCK_EVENTS = [
    { date: "01-01", label: "New Year's Day" },
    { date: "03-14", label: "Pi Day" },
    { date: "04-15", label: "Tax Day" },
    { date: "05-04", label: "May the 4th Be With You" },
    { date: "08-01", label: "Meta Hacker Cup Kickoff" },
    { date: "09-10", label: "Google Cloud Study Jams" },
    { date: "10-31", label: "Halloween" },
    { date: "12-25", label: "Christmas Day" }
  ];

  const getEvent = (d) => {
    const md = d.toISOString().split('T')[0].substring(5);
    const found = MOCK_EVENTS.find(e => e.date === md);
    return found ? found.label : null;
  };
  
  // Local storage synced notes { "YYYY-MM-DD": ["note1", "note2"] }
  const [notes, setNotes] = useState({});

  const loadNotes = () => {
    const s = localStorage.getItem('calendarNotes');
    if (s) {
      try {
        const p = JSON.parse(s);
        // backward compatibility for strings
        const n = {};
        for (const k in p) {
          if (Array.isArray(p[k])) {
            n[k] = p[k];
          } else if (typeof p[k] === 'string') {
            n[k] = [p[k]];
          }
        }
        setNotes(n);
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const saveNoteToRange = (s, e, t) => {
    if (!s || !t.trim()) return;
    const n = { ...notes };
    let d = new Date(s);
    const end = e ? new Date(e) : new Date(s);
    
    d.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (d.getTime() <= end.getTime()) {
      const k = d.toISOString().split('T')[0];
      const a = n[k] ? [...n[k]] : [];
      a.push(t);
      n[k] = a;
      d = addDays(d, 1);
    }
    
    setNotes(n);
    localStorage.setItem('calendarNotes', JSON.stringify(n));
  };

  const deleteNote = (d, i) => {
    const k = d.toISOString().split('T')[0];
    if (!notes[k]) return;
    const n = { ...notes };
    const a = [...n[k]];
    a.splice(i, 1);
    if (a.length === 0) {
      delete n[k];
    } else {
      n[k] = a;
    }
    setNotes(n);
    localStorage.setItem('calendarNotes', JSON.stringify(n));
  };

  const getDayNotes = (d) => {
    if (!d) return [];
    const k = d.toISOString().split('T')[0];
    return notes[k] || [];
  };

  const mNext = () => setCurrentDate(d => addMonths(d, 1));
  const mPrev = () => setCurrentDate(d => subMonths(d, 1));

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Selection Logic
  const handleDateClick = (d) => {
    if (!startDate) {
      setStartDate(d);
      setEndDate(null);
      setIsDrawerOpen(true);
    } else if (startDate && !endDate) {
      if (isBefore(d, startDate)) {
        setStartDate(d);
      } else {
        setEndDate(d);
      }
      setIsDrawerOpen(true);
    } else {
      // both set, reset
      setStartDate(d);
      setEndDate(null);
      setIsDrawerOpen(true);
    }
  };

  const handleDateHover = (d) => {
    if (startDate && !endDate) {
      setHoverDate(d);
    } else {
      setHoverDate(null);
    }
  };

  const isSelected = (d) => {
    return (startDate && isSameDay(d, startDate)) || (endDate && isSameDay(d, endDate));
  };

  const isBetween = (d) => {
    if (startDate && endDate) {
      return isAfter(d, startDate) && isBefore(d, endDate);
    }
    if (startDate && !endDate && hoverDate) {
      return isAfter(d, startDate) && isBefore(d, hoverDate);
    }
    return false;
  };

  const bToday = new Date();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return;

      e.preventDefault();
      
      if (e.key === 'Enter') {
        if (!isDrawerOpen) {
           handleDateClick(focusedDate);
           if (!isDrawerOpen) setIsDrawerOpen(true);
        }
        return;
      }

      setFocusedDate(prev => {
        let n = new Date(prev);
        if (e.key === 'ArrowRight') n = addDays(n, 1);
        else if (e.key === 'ArrowLeft') n = addDays(n, -1);
        else if (e.key === 'ArrowUp') n = addDays(n, -7);
        else if (e.key === 'ArrowDown') n = addDays(n, 7);

        if (!isSameMonth(n, currentDate)) {
           setCurrentDate(startOfMonth(n));
        }
        return n;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedDate, currentDate, isDrawerOpen, handleDateClick]);

  // Single-character algorithmic logic for grid specifically requested
  const buildGrid = () => {
    const m = startOfMonth(currentDate);
    const e = endOfMonth(m);
    const s = startOfWeek(m, { weekStartsOn: 0 }); 
    const f = endOfWeek(e, { weekStartsOn: 0 });

    const a = eachDayOfInterval({ start: s, end: f });
    
    // Chunk into weeks
    const g = [];
    const n = a.length;
    for (let i = 0; i < n; i += 7) {
      const r = [];
      for (let j = 0; j < 7; j++) {
        const c = a[i + j];
        r.push({
          date: c,
          isCurrentMonth: isSameMonth(c, m),
          selected: isSelected(c),
          inRange: isBetween(c),
          isStart: startDate && isSameDay(c, startDate),
          isEnd: endDate && isSameDay(c, endDate),
          isToday: isSameDay(c, bToday),
          isFocused: isSameDay(c, focusedDate),
          eventLabel: getEvent(c)
        });
      }
      g.push(r);
    }
    return g;
  };

  return {
    currentDate,
    grid: buildGrid(),
    mNext,
    mPrev,
    handleDateClick,
    handleDateHover,
    startDate,
    endDate,
    hoverDate,
    notes,
    saveNoteToRange,
    deleteNote,
    getDayNotes,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    returnToToday,
    isCurrentMonthView
  };
}
