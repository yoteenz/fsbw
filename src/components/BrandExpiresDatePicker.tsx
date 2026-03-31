import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { bookingFontScript } from './booking/BookingPageChrome';

const POPOVER_WIDTH = 300;

const CALENDAR_LEFT_ARROW_SRC = '/assets/calendar-left-arrow.svg';
const CALENDAR_RIGHT_ARROW_SRC = '/assets/calendar-right-arrow.svg';

const MONTH_LABELS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local calendar date → `YYYY-MM-DD` for form state / `input[type=date]` parity. */
function toIsoDateLocal(y: number, monthIndex: number, day: number): string {
  return `${y}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function parseIsoLocal(iso: string): { y: number; m: number; d: number } | null {
  const t = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [ys, ms, ds] = t.split('-');
  const y = parseInt(ys, 10);
  const m = parseInt(ms, 10) - 1;
  const d = parseInt(ds, 10);
  const check = new Date(y, m, d);
  if (check.getFullYear() !== y || check.getMonth() !== m || check.getDate() !== d) return null;
  return { y, m, d };
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function startWeekdaySun0(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getDay();
}

function formatTriggerLabel(iso: string): string {
  const p = parseIsoLocal(iso);
  if (!p) return '';
  return `${pad2(p.m + 1)}-${pad2(p.d)}-${p.y}`;
}

type Props = {
  value: string;
  onChange: (isoYmd: string) => void;
  /** When true, calendar is always visible on the page (no trigger button or modal popover). */
  inline?: boolean;
};

/**
 * Branded expiry date picker (replaces native `type="date"` popup).
 * Value/onChange use `YYYY-MM-DD` to match prior admin form state.
 */
export default function BrandExpiresDatePicker({ value, onChange, inline = false }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const now = new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  useEffect(() => {
    const p = parseIsoLocal(value);
    if (p) {
      setViewYear(p.y);
      setViewMonth(p.m);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const grid = useMemo(() => {
    const first = startWeekdaySun0(viewYear, viewMonth);
    const dim = daysInMonth(viewYear, viewMonth);
    const cells: Array<{ day: number | null }> = [];
    for (let i = 0; i < first; i++) cells.push({ day: null });
    for (let d = 1; d <= dim; d++) cells.push({ day: d });
    while (cells.length % 7 !== 0) cells.push({ day: null });
    while (cells.length < 42) cells.push({ day: null });
    return cells;
  }, [viewYear, viewMonth]);

  const selectDay = useCallback(
    (day: number) => {
      onChange(toIsoDateLocal(viewYear, viewMonth, day));
      setOpen(false);
    },
    [onChange, viewYear, viewMonth]
  );

  const goPrev = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goNext = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();

  const selectedParsed = parseIsoLocal(value.trim());

  const label = formatTriggerLabel(value);

  const calendarShellClass = inline
    ? 'border border-black overflow-hidden w-full brand-expires-picker-inline'
    : 'border border-black overflow-hidden brand-expires-picker-popover';

  const calendarShellStyle: CSSProperties = inline
    ? {
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        borderWidth: '1.3px',
        backgroundImage: `url('/assets/marble-half.png')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: Math.min(POPOVER_WIDTH, typeof window !== 'undefined' ? window.innerWidth - 16 : POPOVER_WIDTH),
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        zIndex: 10000,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)',
        pointerEvents: 'auto',
        borderWidth: '1.3px',
        backgroundImage: `url('/assets/marble-half.png')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
      };

  const calendarInner = (
    <div
      ref={inline ? undefined : popoverRef}
      className={calendarShellClass}
      onPointerDown={inline ? undefined : (e) => e.stopPropagation()}
      onMouseDown={inline ? undefined : (e) => e.stopPropagation()}
      style={calendarShellStyle}
      role={inline ? undefined : 'dialog'}
      aria-label={inline ? undefined : 'Select expiry date'}
    >
      <div
        className="backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          padding: '12px 10px 14px',
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={goPrev}
            className="shrink-0 bg-transparent px-2 py-1 cursor-pointer flex items-center justify-center"
            style={{ border: 'none' }}
            aria-label="Previous month"
          >
            <img src={CALENDAR_LEFT_ARROW_SRC} alt="" width={22} height={22} draggable={false} />
          </button>
          <p
            style={{
              fontFamily: '"Futura PT Medium", Futura, sans-serif',
              fontSize: '11px',
              color: '#EB1C24',
              margin: 0,
              textAlign: 'center',
              flex: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {MONTH_LABELS[viewMonth]} {viewYear}
          </p>
          <button
            type="button"
            onClick={goNext}
            className="shrink-0 bg-transparent px-2 py-1 cursor-pointer flex items-center justify-center"
            style={{ border: 'none' }}
            aria-label="Next month"
          >
            <img src={CALENDAR_RIGHT_ARROW_SRC} alt="" width={24} height={24} draggable={false} />
          </button>
        </div>

        <div
          className="grid grid-cols-7 gap-y-1 gap-x-0 mb-2"
          style={{ fontFamily: '"Futura PT Medium", Futura, sans-serif' }}
        >
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center"
              style={{
                fontSize: '9px',
                color: '#808080',
                padding: '4px 0',
                textTransform: 'uppercase',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 gap-x-0">
          {grid.map((cell, idx) => {
            const d = cell.day;
            if (d == null) {
              return <div key={idx} className="aspect-square" />;
            }
            const iso = toIsoDateLocal(viewYear, viewMonth, d);
            const isSelected =
              selectedParsed != null &&
              selectedParsed.y === viewYear &&
              selectedParsed.m === viewMonth &&
              selectedParsed.d === d;
            const isToday = viewYear === todayY && viewMonth === todayM && d === todayD;
            const showTodayOutline = isToday && (selectedParsed == null || isSelected);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => selectDay(d)}
                className="aspect-square flex items-center justify-center cursor-pointer"
                style={{
                  fontFamily: '"Futura PT Medium", Futura, sans-serif',
                  fontSize: '11px',
                  fontWeight: isSelected ? 500 : 400,
                  boxSizing: 'border-box',
                  borderStyle: 'solid',
                  borderWidth: isSelected || showTodayOutline ? '1.3px' : '1px',
                  borderColor: isSelected || showTodayOutline ? '#EB1C24' : 'transparent',
                  color: isSelected ? '#EB1C24' : '#000000',
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  minHeight: inline ? '32px' : '36px',
                  padding: 0,
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center mt-3 pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              fontFamily: '"Futura PT Medium", Futura, sans-serif',
              fontSize: '10px',
              color: '#EB1C24',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            CLEAR DATE
          </button>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return <div className="w-full min-w-0 brand-expires-picker-root">{calendarInner}</div>;
  }

  const popover = open ? calendarInner : null;

  return (
    <div className="w-full min-w-0 brand-expires-picker-root">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
        }}
        className="w-full border p-2 block text-left cursor-pointer bg-white hover:bg-gray-50"
        style={{
          fontFamily: '"Futura PT Book", Futura, sans-serif',
          fontSize: '11px',
          borderColor: '#000',
          borderWidth: '1.3px',
          color: label ? '#000' : '#808080',
          textTransform: 'uppercase',
          boxSizing: 'border-box',
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {label || 'SELECT DATE'}
      </button>

      {typeof document !== 'undefined' && popover ? createPortal(popover, document.body) : null}
    </div>
  );
}
