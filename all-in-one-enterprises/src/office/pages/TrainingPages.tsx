import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import {
  TRAINING_MODULES,
  getTrainingRecordsForStaff,
  getTrainingCompletionSummary,
  PRODUCTION_STAFF_ROLES,
} from '../../launch';

export function StaffTrainingCenterPage() {
  const store = useDemoStore();
  const staffId = store.officeStaffId ?? store.staff[0]?.id ?? 'staff-1';
  const records = getTrainingRecordsForStaff(staffId);
  const summary = getTrainingCompletionSummary();

  return (
    <div className="aio-page">
      <header className="aio-page-header">
        <div>
          <p className="aio-eyebrow">Office · Staff Training</p>
          <h1>Staff Training Center</h1>
          <p className="aio-lead">Internal operational training — not a full LMS. Complete modules before pilot launch.</p>
        </div>
        <nav className="aio-inline-nav">
          <Link to={aioPaths.office}>← Office</Link>
          <Link to={aioPaths.officeTrainingSops}>SOP Library</Link>
          <Link to={aioPaths.officeManagementLaunch}>Launch Control</Link>
        </nav>
      </header>

      <section className="aio-card">
        <h2>Progress</h2>
        <p>{summary.completed} / {summary.total} modules completed ({summary.percentComplete}%)</p>
        <p className="aio-data-note">Production requires ≥80% completion for launch readiness (demo baseline).</p>
      </section>

      <section className="aio-card">
        <h2>Production staff roles</h2>
        <p>{PRODUCTION_STAFF_ROLES.join(' · ')}</p>
      </section>

      <table className="aio-table">
        <thead>
          <tr><th>Module</th><th>Category</th><th>Version</th><th>Assigned</th><th>Completed</th><th>SOP</th></tr>
        </thead>
        <tbody>
          {TRAINING_MODULES.map((m) => {
            const rec = records.find((r) => r.moduleId === m.id);
            return (
              <tr key={m.id}>
                <td>{m.title}</td>
                <td>{m.category}</td>
                <td>{m.version}</td>
                <td>{rec?.assigned ? 'Yes' : 'No'}</td>
                <td>{rec?.completed ? `✓ ${rec.completedAt?.slice(0, 10) ?? ''}` : '—'}</td>
                <td>{m.sopPath ? <code>{m.sopPath}</code> : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
