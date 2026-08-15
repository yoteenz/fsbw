import { resetAllDemoData } from '../storage/demoStorage';
import { intakeRepository } from '../intake/intakeState';
import { roadmapRepository } from '../repositories/roadmapRepository';
import { servicePlanRepository } from '../repositories/servicePlanRepository';
import { serviceRequestRepository } from '../repositories/serviceRequestRepository';

export function AIODebugBanner() {
  const handleReset = () => {
    if (window.confirm('Reset all demo data? This clears intake, roadmap, service plan, and requests.')) {
      resetAllDemoData();
      intakeRepository.clear();
      roadmapRepository.clear();
      servicePlanRepository.clear();
      serviceRequestRepository.clear();
      window.location.href = '/all-in-one';
    }
  };

  return (
    <div className="aio-debug-banner" role="status" aria-label="Demo environment">
      <span className="aio-debug-banner__label">AIO PREVIEW · DEMO ENVIRONMENT</span>
      <button type="button" className="aio-debug-banner__reset" onClick={handleReset}>
        Reset Demo Data
      </button>
    </div>
  );
}
