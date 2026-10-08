import { Link } from 'react-router-dom';
import { FILE_POLICY } from '../../vault/vaultConfig';
import { aioPaths } from '../../utils/paths';
import { AioMigrationPanel, AioSteps, Ico, type IcoName } from './AioMigrationKit';

/** Accepted upload types come from the live vault policy (authority supplies the treatment only). */
const TYPE_TILES: Record<string, { icon: 'pdf' | 'image'; tone: string; label: string; ext: string }> = {
  '.pdf': { icon: 'pdf', tone: 'pdf', label: 'PDF', ext: '(.pdf)' },
  '.jpg': { icon: 'image', tone: 'jpg', label: 'JPG', ext: '(.jpg, .jpeg)' },
  '.png': { icon: 'image', tone: 'png', label: 'PNG', ext: '(.png)' },
  '.webp': { icon: 'image', tone: 'webp', label: 'WEBP', ext: '(.webp)' },
};

const PROVIDERS = [
  ['samsara', 'Samsara'],
  ['motive', 'Motive'],
  ['geotab', 'Geotab'],
  ['omnitracs', 'Omnitracs'],
  ['trimble', 'Trimble'],
  ['keeptruckin', 'KeepTruckin'],
] as const;

const PATHS: Array<{ screen: string; image: string; icon: IcoName; gold?: boolean; title: [string, string]; body: string }> = [
  { screen: 'existing', image: '/migration/path-existing.jpg', icon: 'doc', title: ['EXISTING CLIENT', 'FILE'], body: 'Import your current records from another provider or previous system.' },
  { screen: 'new', image: '/migration/path-new.jpg', icon: 'user-plus', gold: true, title: ['NEW CLIENT', 'FILE'], body: 'Start fresh and upload your records to AIO.' },
  { screen: 'batch', image: '/migration/path-bulk.jpg', icon: 'database', gold: true, title: ['BULK BATCH', 'MIGRATION'], body: 'Import multiple clients at once (for fleets or accountants).' },
];

export function MigrationRootScreen({ onOpen, selected = 'existing' }: { onOpen: (screen: string) => void; selected?: string }) {
  const types = FILE_POLICY.allowedExtensions.filter((ext) => ext !== '.jpeg').map((ext) => TYPE_TILES[ext]).filter(Boolean);
  return (
    <div className="amg-root">
      <div className="amg-paths">
        {PATHS.map((path) => (
          <button key={path.screen} type="button" className={path.screen === selected ? 'amg-panel amg-path is-on' : 'amg-panel amg-path'} onClick={() => onOpen(path.screen)}>
            <img className="amg-path__thumb" src={path.image} alt="" />
            <span className={path.gold ? 'amg-path__disc amg-path__disc--gold' : 'amg-path__disc'}>
              <Ico name={path.icon} />
            </span>
            <b className="amg-path__title">
              <span>{path.title[0]}</span>
              <span>{path.title[1]}</span>
            </b>
            <span className="amg-path__body">{path.body}</span>
            <span className="amg-path__go" aria-hidden="true">
              <Ico name="arrow" />
            </span>
          </button>
        ))}
      </div>

      <AioMigrationPanel className="amg-status">
        <h2 className="amg-h2">MIGRATION STATUS</h2>
        <p className="amg-sub">Track the progress of your data after upload.</p>
        <Link className="amg-status__all" to={aioPaths.officeArchiveMigration}>
          VIEW ALL MIGRATIONS <Ico name="arrow" />
        </Link>
        <AioSteps
          steps={[
            { label: 'UPLOAD', sub: 'Files received', state: 'current' },
            { label: 'EXTRACT', sub: 'Reading data', state: 'todo' },
            { label: 'CLASSIFY', sub: 'Organizing records', state: 'todo' },
            { label: 'VALIDATE', sub: 'Checking accuracy', state: 'todo' },
            { label: 'REVIEW', sub: 'Your confirmation', state: 'todo' },
            { label: 'COMPLETE', sub: 'Ready to use', state: 'todo' },
          ]}
        />
      </AioMigrationPanel>

      <div className="amg-duo">
        <AioMigrationPanel className="amg-typespanel">
          <h2 className="amg-h2">SUPPORTED FILE TYPES</h2>
          <p className="amg-sub">Import records from your current provider.</p>
          <ul className="amg-types" style={{ ['--n' as string]: types.length }}>
            {types.map((t) => (
              <li key={t.label}>
                <Ico name={t.icon} className={`amg-filetype amg-filetype--${t.icon === 'pdf' ? 'pdf' : 'jpg'} amg-filetype--t-${t.tone}`} />
                <span>{t.label}</span>
                <span>{t.ext}</span>
              </li>
            ))}
          </ul>
        </AioMigrationPanel>
        <AioMigrationPanel className="amg-provpanel">
          <h2 className="amg-h2">COMMON PROVIDERS</h2>
          <p className="amg-sub">We support most major systems.</p>
          <ul className="amg-providers">
            {PROVIDERS.map(([key, name]) => (
              <li key={key}>
                <img src={`/migration/prov-${key}.png`} alt="" />
                {name}
              </li>
            ))}
          </ul>
          <p className="amg-providers__more">+ MORE PROVIDERS</p>
        </AioMigrationPanel>
      </div>

      <section className="amg-secure">
        <img className="amg-secure__img" src="/migration/secure-laptop.jpg" alt="" />
        <span className="amg-secure__badge" aria-hidden="true">
          <Ico name="shield" />
        </span>
        <b className="amg-secure__title">YOUR DATA IS SECURE</b>
        {/* the tablet master draws the short line; phone and desktop draw the full sentence */}
        <p className="amg-secure__text">
          <span className="amg-secure__long">We use bank-level encryption and secure processing to keep your information safe. Your files are never shared and you stay in control.</span>
          <span className="amg-secure__short">Your files are encrypted and stay under your control.</span>
        </p>
      </section>

      {/* desktop master only: the third support panel */}
      <section className="amg-panel amg-rnext">
        <span className="amg-rnext__disc" aria-hidden="true">
          <Ico name="doc" />
        </span>
        <b className="amg-rnext__title">WHAT HAPPENS NEXT</b>
        <p className="amg-rnext__text">
          Starting a migration path does not activate a client in AIO. Your records are imported, reviewed, and prepared. <strong>PREBUILT is not ACTIVE</strong> — no client
          is created until you complete the setup inside AIO.
        </p>
      </section>
    </div>
  );
}
