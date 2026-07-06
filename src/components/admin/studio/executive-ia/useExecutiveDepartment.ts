import { useCallback, useState } from 'react';

/** Tracks active department wing — selecting transforms workspace beneath cards. */
export function useExecutiveDepartment<T extends string>(initial: T) {
  const [activeDepartment, setActiveDepartment] = useState<T>(initial);

  const selectDepartment = useCallback((id: T) => {
    setActiveDepartment(id);
  }, []);

  return { activeDepartment, selectDepartment, setActiveDepartment };
}
