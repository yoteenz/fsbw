import { SLAY_TICKET_PACKS } from '../../utils/slayTicketPacks';

const PACKS_PER_ROW = 3;

type SlayTicketPackPickerProps = {
  value: string;
  onChange: (packId: string) => void;
};

function slayTicketPackRows() {
  const rows: (typeof SLAY_TICKET_PACKS)[] = [];
  for (let i = 0; i < SLAY_TICKET_PACKS.length; i += PACKS_PER_ROW) {
    rows.push(SLAY_TICKET_PACKS.slice(i, i + PACKS_PER_ROW));
  }
  return rows;
}

export default function SlayTicketPackPicker({ value, onChange }: SlayTicketPackPickerProps) {
  return (
    <>
      <style>{`
        .slay-ticket-pack-option {
          display: inline-block;
          box-sizing: border-box;
          border: 1.3px solid #000000;
          background-color: #ffffff !important;
          padding: 4px 8px;
          min-width: 0;
          flex: 1 1 0;
          max-width: 96px;
          text-align: center;
          font-family: "Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif;
          font-size: 10px;
          font-weight: 500;
          line-height: 1.2;
          color: #000000 !important;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
        }
        .slay-ticket-pack-option[data-selected='true'] {
          border: 1.3px solid #eb1c24 !important;
          color: #eb1c24 !important;
          font-weight: 500;
        }
        .slay-ticket-pack-option[data-selected='false'] {
          border: 1.3px solid #000000 !important;
          color: #000000 !important;
          font-weight: 500;
        }
        .slay-ticket-pack-option:active {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        role="radiogroup"
        aria-label="Select ticket pack"
        className="mb-6"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          transform: 'translateY(-7px)',
          width: '100%',
          maxWidth: '320px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {slayTicketPackRows().map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: '8px',
              width: '100%',
            }}
          >
            {row.map((pack) => {
              const isSelected = value === pack.id;
              return (
                <div
                  key={pack.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  data-selected={isSelected ? 'true' : 'false'}
                  className="slay-ticket-pack-option"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    onChange(pack.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onChange(pack.id);
                    }
                  }}
                >
                  {pack.ticketCount} TICKETS
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
