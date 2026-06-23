import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type BridgeValue = {
  finalTotal: number;
  setFinalTotal: (value: number) => void;
  submit: () => void;
  registerSubmit: (fn: () => void) => void;
};

const DesktopCuratorCheckoutBridgeContext = createContext<BridgeValue | null>(null);

export function DesktopCuratorCheckoutBridgeProvider({ children }: { children: ReactNode }) {
  const [finalTotal, setFinalTotal] = useState(0);
  const [submitFn, setSubmitFn] = useState<(() => void) | null>(null);

  const registerSubmit = useCallback((fn: () => void) => {
    setSubmitFn(() => fn);
  }, []);

  const submit = useCallback(() => {
    submitFn?.();
  }, [submitFn]);

  const value = useMemo(
    () => ({
      finalTotal,
      setFinalTotal,
      submit,
      registerSubmit,
    }),
    [finalTotal, submit, registerSubmit],
  );

  return (
    <DesktopCuratorCheckoutBridgeContext.Provider value={value}>
      {children}
    </DesktopCuratorCheckoutBridgeContext.Provider>
  );
}

export function useDesktopCuratorCheckoutBridge(): BridgeValue | null {
  return useContext(DesktopCuratorCheckoutBridgeContext);
}
