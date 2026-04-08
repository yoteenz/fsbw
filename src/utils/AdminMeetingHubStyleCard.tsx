import type { MouseEvent } from 'react';
import type { AdminMeeting } from './adminMeetingsMock';
import {
  consultInspo,
  formatBookingAddonsLineForCardDisplay,
  formatBookingInstallLineForCard,
  formatHeaderDate,
  formatMinutesAsHoursAndMinutes,
  formatUsd,
  getBookingPaymentStatusForCard,
  meetingClientDisplayNameWithState,
  meetingClientProfilePhoto,
  tierLabelColor,
  tierPremium,
} from './adminMeetingClientPanels';

export type AdminMeetingHubStyleCardVariant = 'booking' | 'consult';

export type AdminMeetingHubStyleCardProps = {
  m: AdminMeeting;
  variant: AdminMeetingHubStyleCardVariant;
  onProfileClick?: () => void;
  onActionClick: (e: MouseEvent<HTMLButtonElement>) => void;
  actionAriaLabel: string;
  onConsultPhotoClick?: (src: string) => void;
  /** Nudge avatar + body copy together (e.g. admin client-details Appointments tab). */
  contentInsetLeftPx?: number;
};

/** Same white card + profile column + top-right edit icon as Admin → Meetings booking/consult lists. */
export function AdminMeetingHubStyleCard({
  m,
  variant,
  onProfileClick,
  onActionClick,
  actionAriaLabel,
  onConsultPhotoClick,
  contentInsetLeftPx,
}: AdminMeetingHubStyleCardProps) {
  const meta = m.metadata || {};
  const hair = String(meta.hairOption || m.notes || '—');
  const notes = String(meta.consultNotes || '').trim() || m.notes;
  const imgs = variant === 'consult' ? consultInspo(m) : [];

  return (
    <div
      className="mb-3"
      style={{
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '0',
        padding: '10px',
      }}
    >
      <div className="flex justify-between items-start" style={{ gap: '12px' }}>
        <div
          className="min-w-0 flex-1"
          style={contentInsetLeftPx != null && contentInsetLeftPx !== 0 ? { paddingLeft: contentInsetLeftPx } : undefined}
        >
          <div className="flex items-start gap-2.5">
            {onProfileClick ? (
              <button
                type="button"
                onClick={onProfileClick}
                aria-label="Open client profile"
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 0,
                  flexShrink: 0,
                  marginTop: '8px',
                  marginLeft: '4px',
                }}
              >
                <img
                  src={meetingClientProfilePhoto(m)}
                  alt=""
                  width={44}
                  height={44}
                  style={{
                    width: '44px',
                    height: '44px',
                    objectFit: 'cover',
                    borderRadius: '9999px',
                    border: '0.8px solid #000',
                    display: 'block',
                  }}
                />
              </button>
            ) : (
              <div style={{ flexShrink: 0, marginTop: '8px', marginLeft: '4px', lineHeight: 0 }}>
                <img
                  src={meetingClientProfilePhoto(m)}
                  alt=""
                  width={44}
                  height={44}
                  style={{
                    width: '44px',
                    height: '44px',
                    objectFit: 'cover',
                    borderRadius: '9999px',
                    border: '0.8px solid #000',
                    display: 'block',
                  }}
                />
              </div>
            )}
            {variant === 'booking' ? (
              <div className="min-w-0 flex-1" style={{ marginLeft: '6px' }}>
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: '7px 0 0' }}>
                  <span style={{ color: '#EB1C24' }}>{meetingClientDisplayNameWithState(m)}</span>{' '}
                  <span style={{ color: tierLabelColor(m) }}>· {tierPremium(m) ? 'PREMIUM' : 'STANDARD'}</span>
                </p>
                <p
                  style={{
                    fontFamily: '"Futura PT Demi"',
                    fontSize: '10px',
                    color: '#808080',
                    margin: '4px 0 0',
                  }}
                >
                  {formatBookingInstallLineForCard(m)}
                </p>
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '9px',
                    color: '#000000',
                    margin: '4px 0 0',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                  }}
                >
                  {formatBookingAddonsLineForCardDisplay(m)}
                </p>
                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#EB1C24', margin: '4px 0 0' }}>
                  {formatHeaderDate(m.date)} · {m.time} · {formatMinutesAsHoursAndMinutes(m.duration)}
                </p>
                {(() => {
                  const payment = getBookingPaymentStatusForCard(m);
                  const isRedDueBar = payment.dueWithinFinal48Hours || payment.duePassed;
                  return (
                    <>
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#000', margin: '12px 0 0' }}>
                        CURRENT BALANCE: {formatUsd(payment.remainingDueUsd)} OF {formatUsd(payment.paidTotalUsd)} USD
                      </p>
                      <div style={{ marginTop: '4px' }}>
                        <div
                          style={{
                            width: '100%',
                            height: '9px',
                            backgroundColor: isRedDueBar ? '#EB1C24' : '#E0E0E0',
                            borderRadius: '0',
                            overflow: 'hidden',
                            border: isRedDueBar ? '1px solid #000000' : '1px solid #808080',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div
                            style={{
                              width: `${payment.dueProgressPct}%`,
                              height: '100%',
                              backgroundColor: isRedDueBar ? '#EB1C24' : '#808080',
                              transition: 'width 0.3s ease',
                              borderRadius: '0',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '7px' }}>
                          <p
                            style={{
                              fontFamily: '"Futura PT Demi"',
                              fontSize: '9px',
                              color: '#808080',
                              margin: 0,
                            }}
                          >
                            PAYMENT DUE: {payment.finalPaymentDueDateText}
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '9px',
                              color: '#EB1C24',
                              margin: 0,
                              textAlign: 'right',
                            }}
                          >
                            {payment.finalPaymentDueText}
                          </p>
                        </div>
                        {payment.autopayStatus === 'paid' ? (
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#808080', margin: '0 0 2px' }}>
                            AUTOPAY STATUS: FINAL PAYMENT PROCESSED SUCCESSFULLY
                          </p>
                        ) : payment.autopayStatus === 'failed' ? (
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#EB1C24', margin: '0 0 2px' }}>
                            AUTOPAY STATUS: FAILED{payment.autopayLastError ? ` · ${payment.autopayLastError}` : ''}
                          </p>
                        ) : payment.autopayStatus === 'scheduled' ? (
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#808080', margin: '0 0 2px' }}>
                            AUTOPAY STATUS: SCHEDULED ON CARD ON FILE
                          </p>
                        ) : null}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="min-w-0 flex-1">
                <p
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    margin: 0,
                    color: '#EB1C24',
                    transform: 'translate(6px, 6px)',
                  }}
                >
                  {meetingClientDisplayNameWithState(m)}{' '}
                  <span style={{ color: tierLabelColor(m) }}>· {tierPremium(m) ? 'PREMIUM' : 'STANDARD'}</span>
                </p>
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#000', margin: '8px 0 0', marginLeft: '6px' }}>
                  {hair}
                </p>
                {imgs.length > 0 && (
                  <div className="flex flex-wrap mt-2" style={{ marginLeft: '10px', gap: '8px' }}>
                    {imgs.slice(0, 3).map((src, i) => {
                      const thumb = (
                        <img
                          src={src}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      );
                      const frameStyle = {
                        width: '50px',
                        height: '50px',
                        background: '#f3f4f6',
                        border: '3px solid #FFFFFF',
                        boxShadow: '0 0 0 1.1px #000000',
                        boxSizing: 'border-box' as const,
                        overflow: 'hidden',
                        padding: 0,
                      };
                      if (onConsultPhotoClick) {
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              onConsultPhotoClick(src);
                            }}
                            aria-label="Enlarge submitted consult photo"
                            style={{ ...frameStyle, cursor: 'zoom-in' }}
                          >
                            {thumb}
                          </button>
                        );
                      }
                      return (
                        <div key={i} style={frameStyle}>
                          {thumb}
                        </div>
                      );
                    })}
                  </div>
                )}
                <p
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '9px',
                    color: '#808080',
                    marginTop: '8px',
                    marginLeft: '6px',
                    marginBottom: '3px',
                  }}
                >
                  {notes}
                </p>
                <div style={{ height: '3px' }} />
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onActionClick}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px',
            flexShrink: 0,
            position: 'relative',
            zIndex: 2,
            marginTop: '4px',
            marginRight: '3px',
          }}
          aria-label={actionAriaLabel}
        >
          <img src="/assets/edit-meeting-icon-booking.svg" alt="" width={11} height={11} />
        </button>
      </div>
    </div>
  );
}
