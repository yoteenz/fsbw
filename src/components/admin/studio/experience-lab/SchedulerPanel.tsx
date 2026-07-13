import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  getOsSchedulerDashboard,
  listOsJobs,
  reconcileOsScheduler,
  approveOsJob,
  setSchedulerPaused,
  isSchedulerPaused,
  trySchedulerDispatch,
  recoverOsJob,
  OS_SCHEDULER_VERSION,
  JOB_CLASSES,
} from '../../../../studio-os-core/implementation-orchestrator';

const sectionStyle: CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #e5e7eb',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  color: '#111',
};

const labelStyle: CSSProperties = {
  margin: '0 0 4px',
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#6366F1',
};

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '10px 12px',
  marginBottom: 8,
};

const btnStyle: CSSProperties = {
  padding: '6px 10px',
  margin: '4px 4px 4px 0',
  border: '1px solid #333',
  background: '#fff',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '10px',
};

/** Experience Lab — Studio World Operating System Scheduler™ control center. */
export function SchedulerPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string>('all');

  const dashboard = useMemo(() => {
    void refreshKey;
    reconcileOsScheduler();
    return getOsSchedulerDashboard();
  }, [refreshKey]);

  const jobs = useMemo(() => {
    void refreshKey;
    const all = listOsJobs();
    if (classFilter === 'all') return all;
    return all.filter((j) => j.jobClass === classFilter);
  }, [refreshKey, classFilter]);

  const paused = useMemo(() => isSchedulerPaused(), [refreshKey]);
  const selected = jobs.find((j) => j.jobId === selectedJobId) ?? dashboard.critical[0] ?? dashboard.queued[0];

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <section style={sectionStyle} data-os-scheduler-panel>
      <p style={labelStyle}>STUDIO WORLD OPERATING SYSTEM SCHEDULER™</p>
      <p style={{ margin: '0 0 12px', color: '#555' }}>
        Universal scheduling engine — {OS_SCHEDULER_VERSION} · {jobs.length} jobs · {JOB_CLASSES.length} job classes
      </p>

      <div style={{ marginBottom: 12 }}>
        <button type="button" style={btnStyle} onClick={refresh}>
          Refresh scheduler
        </button>
        <button
          type="button"
          style={{ ...btnStyle, fontWeight: paused ? 800 : 400 }}
          onClick={() => {
            setSchedulerPaused(!paused);
            refresh();
          }}
        >
          {paused ? 'Resume scheduler' : 'Pause scheduler'}
        </button>
        <button
          type="button"
          style={btnStyle}
          onClick={() => {
            trySchedulerDispatch();
            refresh();
          }}
        >
          Run scheduler dispatch
        </button>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={{ ...btnStyle, marginLeft: 4 }}
        >
          <option value="all">All classes</option>
          {JOB_CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div style={cardStyle}>
        <strong>Queue Health</strong>
        <p style={{ margin: '4px 0 0' }}>
          Running {dashboard.running.length} · Queued {dashboard.queued.length} · Blocked {dashboard.blocked.length} ·
          Failed {dashboard.failed.length} · Completed {dashboard.completed.length} · Upcoming {dashboard.upcoming.length}
        </p>
        <p style={{ margin: '4px 0 0', color: '#666' }}>
          Critical {dashboard.critical.length} · ETA jobs {dashboard.estimatedCompletionJobs} · Throughput{' '}
          {dashboard.throughputPerHour}/hr
        </p>
        {dashboard.alerts.length ? (
          <p style={{ margin: '8px 0 0', color: '#b91c1c' }}>{dashboard.alerts.join(' · ')}</p>
        ) : (
          <p style={{ margin: '8px 0 0', color: '#166534' }}>Queue healthy</p>
        )}
      </div>

      <div style={cardStyle}>
        <strong>Resource & Budget</strong>
        <p style={{ margin: '4px 0 0' }}>
          GPU {dashboard.resources.gpuUtilizationPct}% · CPU {dashboard.resources.cpuUtilizationPct}% · Budget $
          {dashboard.resources.budgetConsumedUsd} / ${dashboard.resources.budgetConsumedUsd + dashboard.resources.budgetRemainingUsd}{' '}
          remaining ${dashboard.resources.budgetRemainingUsd}
        </p>
        <p style={{ margin: '4px 0 0' }}>
          Workers allocated: {Object.keys(dashboard.resources.workerAllocation).length} · Queue depth{' '}
          {dashboard.resources.queueDepth}
        </p>
      </div>

      <div style={cardStyle}>
        <strong>Job Board</strong>
        <div style={{ maxHeight: 180, overflowY: 'auto', marginTop: 8 }}>
          {jobs
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .map((job) => (
              <button
                key={job.jobId}
                type="button"
                onClick={() => setSelectedJobId(job.jobId)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: selected?.jobId === job.jobId ? '#eef2ff' : 'transparent',
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontSize: '10px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      job.status === 'COMPLETED'
                        ? '#166534'
                        : job.status === 'BLOCKED' || job.status === 'FAILED'
                          ? '#b91c1c'
                          : '#111',
                  }}
                >
                  {job.status}
                </span>{' '}
                [{job.jobClass}] {job.title}
                {job.priority === 'CRITICAL' ? ' · CRITICAL' : ''}
              </button>
            ))}
        </div>
      </div>

      {selected ? (
        <div style={cardStyle}>
          <strong>{selected.title}</strong>
          <p style={{ margin: '4px 0 0' }}>{selected.description}</p>
          <p style={{ margin: '4px 0 0' }}>
            Class: {selected.jobClass} · Type: {selected.jobType} · Priority: {selected.priority} · Owner:{' '}
            {selected.owner}
          </p>
          <p style={{ margin: '4px 0 0' }}>
            Cost: {selected.estimatedCost} · Duration: {selected.estimatedDuration} · Workers:{' '}
            {selected.assignedWorkers.length ? selected.assignedWorkers.join(', ') : '—'}
          </p>
          {selected.approvalRequirements.some((a) => a.required && !a.satisfied) ? (
            <button
              type="button"
              style={{ ...btnStyle, borderColor: '#6366F1', color: '#6366F1' }}
              onClick={() => {
                approveOsJob(selected.jobId);
                refresh();
              }}
            >
              Approve for dispatch
            </button>
          ) : null}
          {selected.status === 'FAILED' ? (
            <button
              type="button"
              style={btnStyle}
              onClick={() => {
                recoverOsJob(selected.jobId, 'retry');
                refresh();
              }}
            >
              Retry job
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
