import type { ReactNode } from 'react';
import { useStudioKnowledge } from '../../../contexts/StudioKnowledgeContext';
import { StudioInteractiveManualProvider } from '../../../studio-interactive-manual';

/** Bridges Interactive Manual written-doc action to the Knowledge Hub slide-over panel. */
export function StudioManualBridge({ children }: { children: ReactNode }) {
  const { openPanel } = useStudioKnowledge();
  return (
    <StudioInteractiveManualProvider onOpenWrittenDoc={openPanel}>
      {children}
    </StudioInteractiveManualProvider>
  );
}
