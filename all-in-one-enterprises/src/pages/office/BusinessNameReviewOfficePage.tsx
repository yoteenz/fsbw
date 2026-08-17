import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { getBusinessNameReviewQueue } from '../../demo/businessNameCheckActions';
import { enrichWorkItem } from '../../office-core/officeWorkEngine';
import { OfficeWorkList } from '../../components/OfficeCommandCenterComponents';

export function OfficeBusinessNameReviewPage() {
  const store = useDemoStore();
  const items = useMemo(() => {
    return getBusinessNameReviewQueue(store).map((w) => enrichWorkItem(w, store));
  }, [store]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Business Name Review</h1>
        <p>
          Manual verification queue for business names that could not be automatically confirmed against a state
          registry.
        </p>
      </header>
      {items.length === 0 ? (
        <p className="aio-office-empty">No pending business name reviews.</p>
      ) : (
        <OfficeWorkList title="Pending Reviews" items={items} />
      )}
    </div>
  );
}
