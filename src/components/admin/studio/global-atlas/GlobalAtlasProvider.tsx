import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  buildGlobalAtlasShortcuts,
  formatOrbAtlasGuideLine,
  parseOrbAtlasNavigationIntent,
  pickDefaultMapMode,
  recordGlobalAtlasVisit,
  resolveAtlasAnchorForPath,
  resolveAtlasContextForPath,
  resolveGlobalAtlasLocation,
  type AtlasAnchor,
  type GlobalAtlasShortcut,
  type OrbAtlasNavigationIntent,
} from '../../../../studio-os-core/global-atlas-layer';
import {
  formatAtlasCollaboratorLine,
  resolveAtlasCollaboratorMarkers,
  type AtlasCollaboratorMarker,
} from '../../../../studio-os-core/collaborative-innovation-network';
import {
  ATLAS_TRAVEL_LABELS,
  type AtlasNode,
  type AtlasTravelMode,
} from '../../../../studio-os-core/studio-world-atlas';
import { useStudioWorldAtlas } from '../../../../hooks/useStudioWorldAtlas';

export type GlobalAtlasLayerContextValue = {
  isOpen: boolean;
  anchor: AtlasAnchor;
  locationLabel: string;
  currentNodeId: string;
  shortcuts: GlobalAtlasShortcut[];
  orbGuideLine: string | null;
  collaboratorLine: string | null;
  atlasCollaborators: AtlasCollaboratorMarker[];
  traveling: boolean;
  openAtlas: () => void;
  closeAtlas: () => void;
  toggleAtlas: () => void;
  travelToNode: (nodeId: string) => Promise<void>;
  handleOrbNavigation: (text: string) => void;
  atlas: ReturnType<typeof useStudioWorldAtlas>;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
};

const GlobalAtlasLayerContext = createContext<GlobalAtlasLayerContextValue | null>(null);

export function GlobalAtlasProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { workspace, workspaceId } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [traveling, setTraveling] = useState(false);
  const [travelOverlay, setTravelOverlay] = useState<{ message: string; className: string } | null>(null);
  const [orbGuideLine, setOrbGuideLine] = useState<string | null>(null);

  const companyName = workspace.displayName;
  const anchor = useMemo(() => resolveAtlasAnchorForPath(pathname), [pathname]);
  const location = useMemo(() => resolveGlobalAtlasLocation(pathname, companyName), [pathname, companyName]);
  const context = useMemo(() => resolveAtlasContextForPath(pathname), [pathname]);

  const atlas = useStudioWorldAtlas({
    companyName,
    organizationId: workspaceId ?? 'frontal-slayer',
    liveRefreshMs: 60_000,
  });

  const shortcuts = useMemo(
    () => buildGlobalAtlasShortcuts(pathname, companyName),
    [pathname, companyName, isOpen]
  );

  const atlasCollaborators = useMemo(
    () => resolveAtlasCollaboratorMarkers(workspaceId ?? 'frontal-slayer'),
    [workspaceId, isOpen]
  );

  const collaboratorLine = useMemo(
    () => formatAtlasCollaboratorLine(atlasCollaborators),
    [atlasCollaborators]
  );

  const syncLocationFocus = useCallback(() => {
    const mode = pickDefaultMapMode(context);
    atlas.setMapMode(mode);
    atlas.focusOn(location.nodeId);
    setSelectedNodeId(location.nodeId);
  }, [atlas, context, location.nodeId]);

  const openAtlas = useCallback(() => {
    syncLocationFocus();
    setIsOpen(true);
    setOrbGuideLine('Global Atlas Layer™ — one living world. Your current location is highlighted.');
    document.body.classList.add('global-atlas-layer-open');
  }, [syncLocationFocus]);

  const closeAtlas = useCallback(() => {
    setIsOpen(false);
    setTravelOverlay(null);
    document.body.classList.remove('global-atlas-layer-open');
  }, []);

  const toggleAtlas = useCallback(() => {
    if (isOpen) closeAtlas();
    else openAtlas();
  }, [isOpen, openAtlas, closeAtlas]);

  const travelToNode = useCallback(
    async (nodeId: string) => {
      const node = atlas.catalog.find((n) => n.id === nodeId);
      if (!node || node.isPlanned || node.isConcept) return;
      const resolution = atlas.resolveTravel(nodeId);
      if (!resolution) return;

      setTraveling(true);
      const cinematic = resolution.cinematicClass.replace('atlas-travel-', '');
      setTravelOverlay({
        message: `${resolution.verb} ${node.displayName}…`,
        className: cinematic,
      });

      recordGlobalAtlasVisit({
        path: resolution.path,
        nodeId,
        label: node.displayName,
      });

      await new Promise((r) => window.setTimeout(r, resolution.transitionMs));
      navigate(resolution.path);
      atlas.clearTravelingRoads();
      setTraveling(false);
      setTravelOverlay(null);
      closeAtlas();
    },
    [atlas, navigate, closeAtlas]
  );

  const handleOrbNavigation = useCallback(
    (text: string) => {
      const intent = parseOrbAtlasNavigationIntent(text);
      if (!intent) return;
      setOrbGuideLine(formatOrbAtlasGuideLine(intent));
      if (intent.action === 'open') {
        openAtlas();
        return;
      }
      if (intent.targetNodeId) {
        openAtlas();
        atlas.focusOn(intent.targetNodeId);
        setSelectedNodeId(intent.targetNodeId);
        if (intent.action === 'travel' && intent.confidence > 0.8) {
          void travelToNode(intent.targetNodeId);
        }
      }
    },
    [openAtlas, atlas, travelToNode]
  );

  useEffect(() => {
    if (!isOpen) return;
    syncLocationFocus();
  }, [pathname, isOpen, syncLocationFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        toggleAtlas();
      }
      if (e.key === 'Escape' && isOpen) closeAtlas();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, toggleAtlas, closeAtlas]);

  const value: GlobalAtlasLayerContextValue = {
    isOpen,
    anchor,
    locationLabel: location.label,
    currentNodeId: location.nodeId,
    shortcuts,
    orbGuideLine,
    collaboratorLine,
    atlasCollaborators,
    traveling,
    openAtlas,
    closeAtlas,
    toggleAtlas,
    travelToNode,
    handleOrbNavigation,
    atlas,
    selectedNodeId,
    setSelectedNodeId,
  };

  return (
    <GlobalAtlasLayerContext.Provider value={value}>
      {children}
      {travelOverlay ? (
        <div className={`gal-travel-overlay is-${travelOverlay.className}`} aria-hidden>
          <p className="gal-travel-msg">{travelOverlay.message}</p>
        </div>
      ) : null}
    </GlobalAtlasLayerContext.Provider>
  );
}

export function useGlobalAtlasLayer(): GlobalAtlasLayerContextValue {
  const ctx = useContext(GlobalAtlasLayerContext);
  if (!ctx) throw new Error('useGlobalAtlasLayer must be used within GlobalAtlasProvider');
  return ctx;
}

export function useGlobalAtlasLayerOptional(): GlobalAtlasLayerContextValue | null {
  return useContext(GlobalAtlasLayerContext);
}

export function pickVisibleDestinations(
  nodes: AtlasNode[],
  focusId: string,
  currentId: string,
  limit = 12
): AtlasNode[] {
  return nodes
    .filter((n) => n.id !== focusId && n.travelPath && !n.isPlanned && !n.isConcept)
    .slice(0, limit)
    .map((n) => n)
    .concat(
      nodes.filter((n) => n.id === currentId)
    )
    .filter((n, i, arr) => arr.findIndex((x) => x.id === n.id) === i)
    .slice(0, limit + 1);
}

export { ATLAS_TRAVEL_LABELS };
export type { AtlasTravelMode, OrbAtlasNavigationIntent };
