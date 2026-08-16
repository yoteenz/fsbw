import { useOfficeCommandCenter } from '../../office-core/useOfficeCommandCenter';
import {
  OfficeAllCaughtUp,
  OfficeAttentionList,
  OfficeCommandCenterHeader,
  OfficeManagerSummary,
  OfficeNextActionHero,
  OfficeQueueGrid,
  OfficeRoleModules,
  OfficeWorkList,
} from '../../components/OfficeCommandCenterComponents';
import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import { useDemoStore } from '../../demo/useDemoStore';

export function OfficeDashboardPage() {
  const view = useOfficeCommandCenter();
  const store = useDemoStore();

  return (
    <div className="aio-office-page aio-oc-home">
      <OfficeCommandCenterHeader view={view} />

      <OfficeNextActionHero action={view.nextAction} />

      {view.allCaughtUp && !view.context.isManager && <OfficeAllCaughtUp />}

      <div className="aio-oc-home-grid">
        <div className="aio-oc-home-main">
          <OfficeAttentionList items={view.attentionItems} />
          <OfficeWorkList title="Due Today" items={view.dueToday} />
          <OfficeWorkList title="Overdue" items={view.overdue} emptyText="No overdue assigned work." />
          <OfficeRoleModules modules={view.roleModules} />
          {view.context.isManager && <OfficeManagerSummary view={view} />}
        </div>
        <aside className="aio-oc-home-aside">
          <OfficeQueueGrid queues={view.queues} />
          <section className="aio-oc-panel">
            <h2 className="aio-oc-panel__title">Quick Links</h2>
            <nav className="aio-oc-quick-links">
              <Link to={aioPaths.officeWork}>My Work</Link>
              <Link to={aioPaths.officeQueues}>Queues</Link>
              <Link to={aioPaths.officeClients}>Clients</Link>
              <Link to={aioPaths.officeInbox}>Inbox</Link>
              {view.context.permissions.includes('crm.read') && <Link to={aioPaths.officeCrm}>CRM</Link>}
              {view.context.isManager && <Link to={aioPaths.officeWorkload}>Workload</Link>}
            </nav>
          </section>
          <section className="aio-oc-panel">
            <h2 className="aio-oc-panel__title">Recent Activity</h2>
            <ul className="aio-office-activity">
              {store.activity.filter((a) => a.visibility === 'internal').slice(0, 8).map((a) => (
                <li key={a.id}>
                  <time>{new Date(a.createdAt).toLocaleString()}</time>
                  <span>{a.title}</span>
                </li>
              ))}
            </ul>
            <Link to={aioPaths.officeActivity} className="aio-office-link">Full activity →</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
