import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NDXBOOK_WORKSPACE_ID } from '../studio-os-core/ndxbook/constants';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';

/** Pin active workspace to AI Media (NDXBOOK) for the rest of the session on this page. */
export function useEnsureNdxbookWorkspaceOnMount(): void {
  const { setActiveWorkspace } = useWorkspace();
  useEffect(() => {
    setActiveWorkspace(NDXBOOK_WORKSPACE_ID);
  }, [setActiveWorkspace]);
}

/** When `?brand=ndxbook` is present, switch workspace before distribution/social data loads. */
export function useEnsureNdxbookWorkspaceFromBrandParam(): void {
  const [searchParams] = useSearchParams();
  const { setActiveWorkspace, workspaceId } = useWorkspace();
  const isNdxbook = searchParams.get('brand') === 'ndxbook';

  useEffect(() => {
    if (isNdxbook && workspaceId !== NDXBOOK_WORKSPACE_ID) {
      setActiveWorkspace(NDXBOOK_WORKSPACE_ID);
    }
  }, [isNdxbook, workspaceId, setActiveWorkspace]);
}
