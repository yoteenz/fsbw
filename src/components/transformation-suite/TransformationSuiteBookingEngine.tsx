import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import { TransformationSuitePanelAnchor } from './TransformationSuitePanelAnchor';

const EXPERIENCE_OPTIONS = [
  { id: 'consultation', label: 'Consultation' },
  { id: 'install', label: 'Install Service' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'color', label: 'Color Service' },
] as const;

const TIME_SLOTS = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

export function TransformationSuiteBookingEngine({ measureRef }: Props) {
  const [experience, setExperience] = useState<string>(EXPERIENCE_OPTIONS[0].id);
  const [date, setDate] = useState('2026-05-25');
  const [time, setTime] = useState(TIME_SLOTS[0]);

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(`${date}T12:00:00`));
    } catch {
      return date;
    }
  }, [date]);

  return (
    <>
      <TransformationSuitePanelAnchor measureRef={measureRef} regionId="DEBUG_CIRCLE_HEADER" zIndex={11}>
        <div className="ts-booking-step">
          <p className="ts-booking-step__label">1. Choose Your Experience</p>
        </div>
      </TransformationSuitePanelAnchor>

      <TransformationSuitePanelAnchor measureRef={measureRef} regionId="DEBUG_SERVICE_GRID" zIndex={11}>
        <div className="ts-booking-grid" role="group" aria-label="Choose experience">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={['ts-booking-grid__btn', experience === opt.id ? 'is-active' : ''].filter(Boolean).join(' ')}
              onClick={() => setExperience(opt.id)}
            >
              <span className="ts-booking-grid__icon" aria-hidden />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </TransformationSuitePanelAnchor>

      <TransformationSuitePanelAnchor measureRef={measureRef} regionId="DEBUG_DATE_PICKER" zIndex={11}>
        <div className="ts-booking-step">
          <p className="ts-booking-step__label">2. Select Date</p>
          <label className="ts-booking-date">
            <span className="sr-only">Select date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <span className="ts-booking-date__display">{formattedDate}</span>
          </label>
        </div>
      </TransformationSuitePanelAnchor>

      <TransformationSuitePanelAnchor measureRef={measureRef} regionId="DEBUG_TIME_PICKER" zIndex={11}>
        <div className="ts-booking-step">
          <p className="ts-booking-step__label">3. Select Time</p>
          <div className="ts-booking-times">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                className={['ts-booking-times__btn', time === slot ? 'is-active' : ''].filter(Boolean).join(' ')}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </TransformationSuitePanelAnchor>

      <TransformationSuitePanelAnchor measureRef={measureRef} regionId="DEBUG_BOOK_BUTTON" zIndex={11}>
        <div className="ts-booking-step ts-booking-step--cta">
          <p className="ts-booking-step__label">4. Book Experience</p>
          <button type="button" className="ts-booking-cta">
            Book Now
          </button>
        </div>
      </TransformationSuitePanelAnchor>
    </>
  );
}
