import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

const POPOVER_WIDTH = 300;

const CALENDAR_LEFT_ARROW_SRC = '/assets/calendar-left-arrow.svg';
const CALENDAR_RIGHT_ARROW_SRC = '/assets/calendar-right-arrow.svg';

const NAV_ARROW_BASE_LEFT_PX = 22;
const NAV_ARROW_BASE_RIGHT_PX = 24;

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
/** Sun-first columns (matches US locale grid). */
const ADMIN_MEETINGS_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

type CalendarGridCell = {
  day: number | null;
  iso?: string;
  inMonth?: boolean;
};

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

export type AdminCalendarDayMeta = {
  disabled?: boolean;
  /** White cell + red date (has booking that day). */
  appointmentHighlight?: boolean;
  title?: string;
};

type Props = {
  value: string;
  onChange: (isoYmd: string) => void;
  /** When true, calendar is always visible on the page (no trigger button or modal popover). */
  inline?: boolean;
  /** Optional date guard (return true to disable a day). */
  isDateDisabled?: (isoYmd: string) => boolean;
  /** Month nav arrow scale (default 1). Booking A/C passes 0.75 for 25% smaller arrows. */
  navArrowScale?: number;
  /** Calendar month label visual treatment. */
  monthLabelVariant?: 'default' | 'adminMeetings';
  /**
   * Controlled month (e.g. `YYYY-MM-01`). When set with `onVisibleMonthAnchorChange`, prev/next
   * update the parent instead of internal view state (admin meetings hub).
   */
  visibleMonthAnchor?: string;
  onVisibleMonthAnchorChange?: (isoFirstOfMonth: string) => void;
  /** Highlight ring for selected day; defaults to `value` when unset. */
  selectionIso?: string;
  /** Admin meetings: per-day disabled / appointment styling / native title. */
  getDayMeta?: (isoYmd: string) => AdminCalendarDayMeta;
  /** If set, day click invokes this instead of `onChange` (filter mode). */
  onDayClick?: (isoYmd: string) => void;
  /** Hide the bottom CLEAR DATE row (e.g. admin meetings month navigator). */
  hideClearDate?: boolean;
};

/**
 * Branded expiry date picker (replaces native `type="date"` popup).
 * Value/onChange use `YYYY-MM-DD` to match prior admin form state.
 */
export default function BrandExpiresDatePicker({
  value,
  onChange,
  inline = false,
  isDateDisabled,
  navArrowScale = 1,
  monthLabelVariant = 'default',
  visibleMonthAnchor,
  onVisibleMonthAnchorChange,
  selectionIso,
  getDayMeta,
  onDayClick,
  hideClearDate = false,
}: Props) {
  const navLeftPx = Math.max(1, Math.round(NAV_ARROW_BASE_LEFT_PX * navArrowScale));
  const navRightPx = Math.max(1, Math.round(NAV_ARROW_BASE_RIGHT_PX * navArrowScale));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const now = new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const controlledMonth = Boolean(visibleMonthAnchor && onVisibleMonthAnchorChange);

  useEffect(() => {
    if (controlledMonth) {
      const p = parseIsoLocal((visibleMonthAnchor || '').trim());
      if (p) {
        setViewYear(p.y);
        setViewMonth(p.m);
      }
      return;
    }
    const p = parseIsoLocal(value);
    if (p) {
      setViewYear(p.y);
      setViewMonth(p.m);
    }
  }, [value, visibleMonthAnchor, controlledMonth]);

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

  const grid = useMemo<CalendarGridCell[]>(() => {
    if (monthLabelVariant === 'adminMeetings') {
      const first = startWeekdaySun0(viewYear, viewMonth);
      const cur = new Date(viewYear, viewMonth, 1);
      cur.setDate(cur.getDate() - first);
      const cells: CalendarGridCell[] = [];
      for (let i = 0; i < 42; i++) {
        const y = cur.getFullYear();
        const m = cur.getMonth();
        const d = cur.getDate();
        cells.push({
          day: d,
          iso: toIsoDateLocal(y, m, d),
          inMonth: y === viewYear && m === viewMonth,
        });
        cur.setDate(cur.getDate() + 1);
      }
      return cells;
    }

    const first = startWeekdaySun0(viewYear, viewMonth);
    const dim = daysInMonth(viewYear, viewMonth);
    const cells: CalendarGridCell[] = [];
    for (let i = 0; i < first; i++) cells.push({ day: null });
    for (let d = 1; d <= dim; d++) cells.push({ day: d, iso: toIsoDateLocal(viewYear, viewMonth, d), inMonth: true });
    while (cells.length % 7 !== 0) cells.push({ day: null });
    while (cells.length < 42) cells.push({ day: null });
    return cells;
  }, [monthLabelVariant, viewYear, viewMonth]);

  const selectDay = useCallback(
    (dayOrIso: number | string) => {
      onChange(typeof dayOrIso === 'string' ? dayOrIso : toIsoDateLocal(viewYear, viewMonth, dayOrIso));
      setOpen(false);
    },
    [onChange, viewYear, viewMonth]
  );

  const goPrev = useCallback(() => {
    if (controlledMonth && onVisibleMonthAnchorChange) {
      const d = new Date(viewYear, viewMonth - 1, 1);
      onVisibleMonthAnchorChange(toIsoDateLocal(d.getFullYear(), d.getMonth(), 1));
      return;
    }
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, [controlledMonth, onVisibleMonthAnchorChange, viewYear, viewMonth]);

  const goNext = useCallback(() => {
    if (controlledMonth && onVisibleMonthAnchorChange) {
      const d = new Date(viewYear, viewMonth + 1, 1);
      onVisibleMonthAnchorChange(toIsoDateLocal(d.getFullYear(), d.getMonth(), 1));
      return;
    }
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, [controlledMonth, onVisibleMonthAnchorChange, viewYear, viewMonth]);

  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();

  const selectedParsed = parseIsoLocal(value.trim());
  const selectedIso = value.trim();
  const ringIso = (selectionIso ?? selectedIso).trim();
  const isAdminMeetingsVariant = monthLabelVariant === 'adminMeetings';
  const weekdayLabels = isAdminMeetingsVariant ? ADMIN_MEETINGS_WEEKDAYS : WEEKDAYS;

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

  const monthLabelText =
    monthLabelVariant === 'adminMeetings'
      ? MONTH_LABELS[viewMonth].toLowerCase()
      : `${MONTH_LABELS[viewMonth]} ${viewYear}`;

  const monthLabelStyle: CSSProperties =
    monthLabelVariant === 'adminMeetings'
      ? {
          fontFamily: '"Bohemy", sans-serif',
          fontSize: '25px',
          color: '#000',
          margin: 0,
          textAlign: 'center',
          flex: 1,
          textTransform: 'lowercase',
          fontWeight: 200
        }
      : {
          fontFamily: '"Futura PT Medium", Futura, sans-serif',
          fontSize: '11px',
          color: '#EB1C24',
          margin: 0,
          textAlign: 'center',
          flex: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.02em'
        };

  const monthLabelClassName =
    monthLabelVariant === 'adminMeetings' ? 'booking-calendar-month-admin' : undefined;

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
            <img
              src={CALENDAR_LEFT_ARROW_SRC}
              alt=""
              width={navLeftPx}
              height={navLeftPx}
              draggable={false}
            />
          </button>
          <p className={monthLabelClassName} style={monthLabelStyle}>
            {monthLabelText}
          </p>
          <button
            type="button"
            onClick={goNext}
            className="shrink-0 bg-transparent px-2 py-1 cursor-pointer flex items-center justify-center"
            style={{ border: 'none' }}
            aria-label="Next month"
          >
            <img
              src={CALENDAR_RIGHT_ARROW_SRC}
              alt=""
              width={navRightPx}
              height={navRightPx}
              draggable={false}
            />
          </button>
        </div>

        <div
          className={isAdminMeetingsVariant ? 'grid grid-cols-7 gap-1 text-center mb-1' : 'grid grid-cols-7 gap-y-1 gap-x-0 mb-2'}
          style={{ fontFamily: '"Futura PT Medium", Futura, sans-serif' }}
        >
          {weekdayLabels.map((d, idx) => (
            <div
              key={`${d}-${idx}`}
              style={{
                fontSize: isAdminMeetingsVariant ? '8px' : '9px',
                color: '#808080',
                padding: isAdminMeetingsVariant ? '0' : '4px 0',
                textTransform: 'uppercase',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <div className={isAdminMeetingsVariant ? 'grid grid-cols-7 gap-1' : 'grid grid-cols-7 gap-y-1 gap-x-0'}>
          {grid.map((cell, idx) => {
            const d = cell.day;
            if (d == null) {
              return <div key={idx} className={isAdminMeetingsVariant ? '' : 'aspect-square'} />;
            }
            const iso = cell.iso ?? toIsoDateLocal(viewYear, viewMonth, d);
            const meta = getDayMeta?.(iso);
            const metaDisabled = meta?.disabled === true;
            const isDisabled = metaDisabled || (isDateDisabled?.(iso) ?? false);
            const hasApptHighlight = meta?.appointmentHighlight === true;
            const isRingSelected = !isDisabled && ringIso === iso;
            const isToday = viewYear === todayY && viewMonth === todayM && d === todayD;
            const showTodayOutline =
              !isAdminMeetingsVariant && !isDisabled && isToday && (selectedParsed == null || isRingSelected);
            const handleClick = () => {
              if (isDisabled) return;
              if (onDayClick) {
                onDayClick(iso);
                return;
              }
              selectDay(iso);
            };
            const borderColor = isRingSelected
              ? '#EB1C24'
              : isAdminMeetingsVariant && getDayMeta
                ? '#e5e7eb'
                : isAdminMeetingsVariant
                  ? '#e5e7eb'
                  : showTodayOutline
                    ? '#EB1C24'
                    : 'transparent';
            const textColor = isDisabled
              ? '#9ca3af'
              : isAdminMeetingsVariant && getDayMeta
                ? hasApptHighlight
                  ? '#EB1C24'
                  : '#9ca3af'
                : isRingSelected
                  ? '#EB1C24'
                  : '#000000';
            const bgColor =
              isAdminMeetingsVariant && getDayMeta
                ? isDisabled
                  ? '#f3f4f6'
                  : hasApptHighlight
                    ? '#fff'
                    : '#f3f4f6'
                : isAdminMeetingsVariant
                  ? isDisabled
                    ? '#f3f4f6'
                    : '#fff'
                  : isRingSelected
                    ? '#FFFFFF'
                    : 'transparent';
            return (
              <button
                key={iso}
                type="button"
                onClick={handleClick}
                disabled={isDisabled}
                title={meta?.title}
                className={isAdminMeetingsVariant ? '' : 'aspect-square flex items-center justify-center cursor-pointer'}
                style={{
                  fontFamily: '"Futura PT Medium", Futura, sans-serif',
                  fontSize: isAdminMeetingsVariant ? '10px' : '11px',
                  fontWeight: isAdminMeetingsVariant ? 500 : isRingSelected ? 500 : 400,
                  boxSizing: 'border-box',
                  borderStyle: 'solid',
                  borderWidth: isAdminMeetingsVariant ? '1px' : isRingSelected || showTodayOutline ? '1.3px' : '1px',
                  borderColor,
                  color: textColor,
                  backgroundColor: bgColor,
                  minHeight: isAdminMeetingsVariant ? undefined : inline ? '32px' : '36px',
                  padding: isAdminMeetingsVariant ? '6px 0' : 0,
                  borderRadius: 0,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.65 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        {!hideClearDate ? (
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
        ) : null}
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
