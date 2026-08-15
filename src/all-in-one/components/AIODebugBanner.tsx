import { resetDemoStore } from '../demo/demoStore';

export function AIODebugBanner() {
  const handleReset = () => {
    if (
      window.confirm(
        'Reset all demo data? This restores the canonical seed state for clients, requests, office, and portal.',
      )
    ) {
      resetDemoStore();
      window.location.href = '/all-in-one';
    }
  };

  return (
    <div className="aio-debug-banner" role="status" aria-label="Demo environment">
      <span className="aio-debug-banner__label">AIO PREVIEW · DEMO ENVIRONMENT</span>
      <a href="/all-in-one/office" className="aio-debug-banner__office-link">
        Internal Office →
      </a>
      <button type="button" className="aio-debug-banner__reset" onClick={handleReset}>
        Reset Demo Data
      </button>
    </div>
  );
}
