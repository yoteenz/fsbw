import { Link, useNavigate } from 'react-router-dom';
import type { RoadReadyAttentionItem } from '../road-ready/roadReadyTypes';
import { getRoadReadyItems, requestHelpFromRoadReady } from '../demo/roadReadyActions';
import { useRoadReady } from '../road-ready/useRoadReady';
import { aioPaths } from '../utils/paths';

type Props = {
  items: RoadReadyAttentionItem[];
  limit?: number;
  showTitle?: boolean;
};

const actionLabels: Record<RoadReadyAttentionItem['action'], string> = {
  upload: 'Upload Document',
  request_help: 'Get Help With This',
  update_status: 'Update Status',
  message: 'Message All In One',
  review: 'Review Item',
};

export function RoadReadyAttentionCenter({ items, limit = 5, showTitle = true }: Props) {
  const { organizationId } = useRoadReady();
  const navigate = useNavigate();
  const roadItems = getRoadReadyItems(organizationId);

  const handleHelp = (item: RoadReadyAttentionItem) => {
    const ri = roadItems.find((x) => x.id === item.itemId);
    if (ri) {
      const reqId = requestHelpFromRoadReady(organizationId, ri);
      navigate(aioPaths.portalRequest(reqId));
    }
  };

  if (items.length === 0) {
    return (
      <section className="aio-rr-attention">
        {showTitle && <h2 className="aio-rr-section-title">Needs Your Attention</h2>}
        <p className="aio-empty-state__text">No items need immediate attention right now.</p>
      </section>
    );
  }

  const visible = items.slice(0, limit);

  return (
    <section className="aio-rr-attention" aria-labelledby="rr-attention-title">
      {showTitle && (
        <h2 id="rr-attention-title" className="aio-rr-section-title">
          Needs Your Attention
          <span className="aio-rr-attention__count">{items.length}</span>
        </h2>
      )}
      <ul className="aio-rr-attention__list">
        {visible.map((item) => (
          <li key={item.itemId} className="aio-rr-attention__item">
            <div>
              <strong>{item.title}</strong>
              <p>{item.reason}</p>
            </div>
            <div className="aio-rr-attention__actions">
              {item.action === 'request_help' ? (
                <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => handleHelp(item)}>
                  {actionLabels[item.action]}
                </button>
              ) : (
                <Link to={aioPaths.roadReady} className="aio-btn aio-btn--outline aio-btn--sm">
                  {actionLabels[item.action]}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RoadReadyNextStep({
  title,
  body,
  cta,
  onAction,
}: {
  title: string;
  body: string;
  cta: string;
  onAction?: () => void;
}) {
  return (
    <section className="aio-rr-next-step" aria-labelledby="rr-next-step">
      <p className="aio-label">Your Next Step</p>
      <h2 id="rr-next-step">{title}</h2>
      <p>{body}</p>
      {onAction ? (
        <button type="button" className="aio-btn aio-btn--gold" onClick={onAction}>
          {cta}
        </button>
      ) : (
        <Link to={aioPaths.roadReady} className="aio-btn aio-btn--gold">
          {cta}
        </Link>
      )}
    </section>
  );
}
