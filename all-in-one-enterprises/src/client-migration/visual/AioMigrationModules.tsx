/**
 * AIO CLIENT MIGRATION — shared authority modules for the propagated screens (everything after the six representatives).
 * Flow layout in authority units (1u = 1px of the 853×1536 frame): cards, client headers, row lists, chips, stat tiles,
 * fields, drop zones and notes, each sized from the approved authority images. Styles: aio-migration-flow.css.
 */
import { Children, Fragment, isValidElement, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { AioMonogram, AioWhatNext, Ico, type IcoName } from './AioMigrationKit';
import { MigrationSelectSteps } from './MigrationExistingScreens';

export type Tone = 'green' | 'amber' | 'red' | 'gray' | 'gold' | 'blue' | 'violet' | 'dark';

/**
 * Screen body: starts at the authority panel top (`top`, in frame px) and stacks its modules with the authority gap.
 * Phone and tablet: one stack in authority order. Desktop (≥ 1120px): the step card spans the top, cards form the main
 * column and the closing items (what happens next, notes, the action) form a side column. The wrappers are
 * `display: contents` below desktop, so the phone composition is untouched.
 */
export function AioFlow({ top, gap, className = '', children }: { top: number; gap?: number; className?: string; children: ReactNode }) {
  const style = { '--p-top': top, ...(gap != null ? { '--gap': gap } : {}) } as CSSProperties;
  const head: ReactNode[] = [];
  const main: ReactNode[] = [];
  const side: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === MigrationSelectSteps) head.push(child);
    else if (child.type === AioWhatNext || child.type === AioNote || child.type === Fragment) side.push(child);
    else main.push(child);
  });
  const split = side.length > 0 && main.length > 0;
  return (
    <div className={`amg-flow${split ? ' amg-flow--split' : ''} ${className}`} style={style}>
      {head.length ? <div className="amg-flow__top">{head}</div> : null}
      <div className="amg-flow__main">{main}</div>
      {side.length ? <div className="amg-flow__side">{side}</div> : null}
    </div>
  );
}

export function AioCard({ className = '', children, as: Tag = 'section' }: { className?: string; children: ReactNode; as?: 'section' | 'article' | 'div' }) {
  return <Tag className={`amg-card ${className}`}>{children}</Tag>;
}

/** Card title row: title + optional sub, optional right-hand element (count, pill, link). */
export function AioCardHead({ title, sub, right, className = '' }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <header className={`amg-chead ${className}`}>
      <div className="amg-chead__text">
        <h2 className="amg-chead__t">{title}</h2>
        {sub ? <p className="amg-chead__s">{sub}</p> : null}
      </div>
      {right ? <div className="amg-chead__r">{right}</div> : null}
    </header>
  );
}

/** Section head with a leading disc: icon (dark / tinted) or a step number (gold). */
export function AioDiscHead({
  icon,
  num,
  tone = 'dark',
  title,
  sub,
  right,
  className = '',
}: {
  icon?: IcoName;
  num?: number;
  tone?: Tone | 'soft';
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`amg-dhead amg-dhead--${num != null ? 'num' : tone} ${className}`}>
      <span className="amg-dhead__disc" aria-hidden="true">
        {num != null ? num : icon ? <Ico name={icon} /> : null}
      </span>
      <div className="amg-dhead__text">
        <h2 className="amg-dhead__t">{title}</h2>
        {sub ? <p className="amg-dhead__s">{sub}</p> : null}
      </div>
      {right ? <div className="amg-dhead__r">{right}</div> : null}
    </header>
  );
}

/** Client identity: monogram, name, strong identifiers, optional label above and element on the right. */
export function AioClient({
  name,
  ids,
  label,
  right,
  className = '',
}: {
  name: string;
  ids: string[];
  label?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`amg-cl ${className}`}>
      {label ? <b className="amg-cl__label">{label}</b> : null}
      <AioMonogram name={name} className="amg-cl__mono" />
      <div className="amg-cl__id">
        <b className="amg-cl__name">{name}</b>
        {ids.length ? <span className="amg-cl__ids">{ids.join('   |   ')}</span> : null}
      </div>
      {right ? <div className="amg-cl__r">{right}</div> : null}
    </div>
  );
}

export function AioChip({ tone, icon, children, className = '' }: { tone: Tone; icon?: IcoName; children: ReactNode; className?: string }) {
  return (
    <span className={`amg-chip amg-chip--${tone} ${className}`}>
      {icon ? <Ico name={icon} className="amg-chip__icon" /> : null}
      <span className="amg-chip__t">{children}</span>
    </span>
  );
}

/** Coloured status disc (white glyph on a solid tone, or a tinted disc with a dark glyph). */
export function AioDisc({ tone, icon, className = '', children }: { tone: Tone | 'soft' | 'tint'; icon?: IcoName; className?: string; children?: ReactNode }) {
  return (
    <span className={`amg-disc amg-disc--${tone} ${className}`} aria-hidden="true">
      {icon ? <Ico name={icon} /> : children}
    </span>
  );
}

export function AioRows({ className = '', children }: { className?: string; children: ReactNode }) {
  return <ul className={`amg-rows ${className}`}>{children}</ul>;
}

/** One list row: leading icon (tile / disc), title + sub lines, right-hand content, optional chevron. Children render below the row. */
export function AioRow({
  icon,
  lead,
  title,
  sub,
  right,
  chevron = true,
  onClick,
  selected,
  className = '',
  children,
}: {
  icon?: IcoName;
  lead?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      {lead ?? (icon ? (
        <span className="amg-row__icon" aria-hidden="true">
          <Ico name={icon} />
        </span>
      ) : null)}
      <span className="amg-row__text">
        <b className="amg-row__t">{title}</b>
        {sub ? <span className="amg-row__s">{sub}</span> : null}
      </span>
      {right ? <span className="amg-row__r">{right}</span> : null}
      {chevron ? <Ico name="chevron" className="amg-row__chev" /> : null}
    </>
  );
  const cls = `amg-row${selected ? ' is-on' : ''}${onClick ? ' is-action' : ''} ${className}`;
  return (
    <li>
      {onClick ? (
        <button type="button" className={cls} onClick={onClick} aria-pressed={selected}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
      {children}
    </li>
  );
}

/** Stat tile: disc + value + label (+ sub). */
export function AioStat({
  icon,
  tone = 'tint',
  value,
  label,
  sub,
  onClick,
  className = '',
}: {
  icon?: IcoName;
  tone?: Tone | 'tint' | 'soft';
  value: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {icon ? <AioDisc tone={tone} icon={icon} className="amg-stat__disc" /> : null}
      <span className="amg-stat__body">
        <b className="amg-stat__v">{value}</b>
        <b className="amg-stat__l">{label}</b>
        {sub ? <span className="amg-stat__s">{sub}</span> : null}
      </span>
      {onClick ? <Ico name="chevron" className="amg-stat__chev" /> : null}
    </>
  );
  return onClick ? (
    <button type="button" className={`amg-stat amg-stat--${tone} is-action ${className}`} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className={`amg-stat amg-stat--${tone} ${className}`}>{inner}</div>
  );
}

export function AioField({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  wide,
  type = 'text',
  inputMode,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  wide?: boolean;
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'text' | 'numeric' | 'email' | 'tel';
}) {
  return (
    <label className={`amg-field${wide ? ' amg-field--wide' : ''}${readOnly ? ' is-ro' : ''}`}>
      <b className="amg-field__l">{label}</b>
      <input
        className="amg-field__i"
        type={type}
        inputMode={inputMode}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

/** Drop zone: drag and drop (files or a folder) or browse. Accepted types come from the vault policy. */
export function AioDrop({
  icon = 'deploy',
  title,
  hint,
  button,
  buttonIcon,
  types,
  onFiles,
  inputRef,
  className = '',
  divider,
}: {
  icon?: IcoName;
  title: ReactNode;
  hint?: ReactNode;
  button: string;
  buttonIcon?: IcoName;
  types?: ReactNode;
  onFiles: (files: File[]) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  className?: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`amg-drop ${className}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void filesFromDrop(event.dataTransfer).then(onFiles);
      }}
    >
      <Ico name={icon} className="amg-drop__icon" />
      <p className="amg-drop__t">{title}</p>
      {hint ? <p className="amg-drop__h">{hint}</p> : null}
      {divider ? (
        <span className="amg-drop__or" aria-hidden="true">
          <span>OR</span>
        </span>
      ) : null}
      <button type="button" className="amg-drop__btn" onClick={() => inputRef.current?.click()}>
        {buttonIcon ? <Ico name={buttonIcon} /> : null}
        {button}
      </button>
      {types ? <p className="amg-drop__types">{types}</p> : null}
    </div>
  );
}

/** Files from a drop, walking dropped folders (webkitGetAsEntry) so a whole client folder can be dropped at once. */
export async function filesFromDrop(data: DataTransfer): Promise<File[]> {
  const items = Array.from(data.items ?? []);
  const entries = items
    .map((item) => (typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null))
    .filter((entry): entry is FileSystemEntry => Boolean(entry));
  if (!entries.length) return Array.from(data.files ?? []);
  const out: File[] = [];
  const walk = async (entry: FileSystemEntry): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File | null>((resolve) => (entry as FileSystemFileEntry).file(resolve, () => resolve(null)));
      if (file) out.push(file);
      return;
    }
    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      for (;;) {
        const batch = await new Promise<FileSystemEntry[]>((resolve) => reader.readEntries(resolve, () => resolve([])));
        if (!batch.length) break;
        for (const child of batch) await walk(child);
      }
    }
  };
  for (const entry of entries) await walk(entry);
  return out;
}

/** Note card: disc + bold line + text (white card, root-family "PREBUILT · NOT ACTIVE" notes). */
export function AioNote({ icon = 'info-mark', tone = 'dark', title, children, className = '' }: { icon?: IcoName; tone?: Tone | 'soft'; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={`amg-note amg-note--${tone} ${className}`}>
      <AioDisc tone={tone === 'dark' ? 'dark' : tone} icon={icon} className="amg-note__disc" />
      <div className="amg-note__text">
        <b>{title}</b>
        {children ? <p>{children}</p> : null}
      </div>
    </section>
  );
}

/** Thin tinted strip with an outlined info mark (batch family). */
export function AioStrip({ tone = 'amber', icon = 'info-mark', title, children, className = '' }: { tone?: Tone; icon?: IcoName; title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <p className={`amg-strip amg-strip--${tone}${title ? ' has-title' : ''} ${className}`}>
      <span className="amg-strip__icon" aria-hidden="true">
        <Ico name={icon} />
      </span>
      <span className="amg-strip__text">
        {title ? <b>{title}</b> : null}
        <span>{children}</span>
      </span>
    </p>
  );
}

/** Tinted callout: large disc + kicker + headline + text (NOT ACTIVE YET states). */
export function AioCallout({
  tone,
  icon,
  kicker,
  title,
  children,
  className = '',
}: {
  tone: Tone;
  icon: IcoName;
  kicker?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`amg-callout amg-callout--${tone} ${className}`}>
      <AioDisc tone={tone === 'amber' ? 'tint' : tone} icon={icon} className="amg-callout__disc" />
      <div className="amg-callout__text">
        {kicker ? <span className="amg-callout__k">{kicker}</span> : null}
        <b className="amg-callout__t">{title}</b>
        {children ? <span className="amg-callout__s">{children}</span> : null}
      </div>
    </div>
  );
}

/** Extraction confidence as recorded on the facts (HIGH / MEDIUM / LOW / CONFLICT); never an invented percentage. */
export function AioConfidence({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' | 'CONFLICT' | null }) {
  const bars = level === 'HIGH' ? 4 : level === 'MEDIUM' ? 3 : level === 'LOW' ? 2 : level === 'CONFLICT' ? 1 : 0;
  const tone = level === 'HIGH' ? 'green' : level === 'MEDIUM' ? 'green' : level === 'LOW' ? 'amber' : level === 'CONFLICT' ? 'red' : 'gray';
  return (
    <span className={`amg-conf amg-conf--${tone}`}>
      <span className="amg-conf__bars" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <i key={i} className={i <= bars ? 'is-on' : ''} />
        ))}
      </span>
      <b className="amg-conf__v">{level ?? 'NONE'}</b>
      <span className="amg-conf__l">{level ? 'CONFIDENCE' : 'NOT EXTRACTED'}</span>
    </span>
  );
}

/** Small decision buttons (LOOKS RIGHT / NEEDS AN UPDATE / I'M NOT SURE …). */
export function AioChoiceBar<T extends string>({
  options,
  value,
  onChange,
  className = '',
  label,
}: {
  options: Array<{ value: T; label: ReactNode; icon?: IcoName; tone: Tone }>;
  value?: T | null;
  onChange: (value: T) => void;
  className?: string;
  label?: string;
}) {
  return (
    <span className={`amg-cbar ${className}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`amg-cbtn amg-cbtn--${option.tone}${value === option.value ? ' is-on' : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.icon ? <Ico name={option.icon} className="amg-cbtn__icon" /> : null}
          <span>{option.label}</span>
        </button>
      ))}
    </span>
  );
}

/** Generic five-step card (same geometry as the SELECT / COMPANY steps card). */
export type FlowStep = { label: string; sub: string };
