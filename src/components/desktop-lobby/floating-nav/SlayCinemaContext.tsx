import { createContext, useContext, type ReactNode } from 'react';

export type SlayCinemaContextValue = {
  isLoungeZone: boolean;
  isSlayCinemaEnabled: boolean;
  toggleSlayCinema: () => void;
};

const SlayCinemaContext = createContext<SlayCinemaContextValue | null>(null);

type Props = {
  value: SlayCinemaContextValue;
  children: ReactNode;
};

export function SlayCinemaProvider({ value, children }: Props) {
  return <SlayCinemaContext.Provider value={value}>{children}</SlayCinemaContext.Provider>;
}

export function useSlayCinemaOptional(): SlayCinemaContextValue | null {
  return useContext(SlayCinemaContext);
}
