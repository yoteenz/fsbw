import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { servicePlanRepository, type ServicePlanItem } from '../repositories/servicePlanRepository';
import { aioPaths } from '../utils/paths';

export function AIOServicePlanBar() {
  const [items, setItems] = useState<ServicePlanItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(servicePlanRepository.load());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('aio-service-plan-change', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('aio-service-plan-change', refresh);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="aio-service-plan-bar" aria-label="My Service Plan">
      <div className="aio-service-plan-bar__inner">
        <span className="aio-service-plan-bar__label">
          My Service Plan · {items.length} service{items.length !== 1 ? 's' : ''}
        </span>
        <Link to={aioPaths.servicePlan} className="aio-service-plan-bar__link">
          Review My Plan →
        </Link>
      </div>
    </div>
  );
}

export function useServicePlan() {
  const [items, setItems] = useState<ServicePlanItem[]>(() => servicePlanRepository.load());

  const refresh = () => setItems(servicePlanRepository.load());

  const add = (item: ServicePlanItem) => {
    servicePlanRepository.add(item);
    refresh();
  };

  const remove = (slug: string) => {
    servicePlanRepository.remove(slug);
    refresh();
  };

  return { items, add, remove, refresh };
}
