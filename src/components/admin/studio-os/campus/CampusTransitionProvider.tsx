import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  buildCampusArrivalBriefing,
  campusTransitionDurations,
  readCampusTransitionSpeed,
  resolveHeadquartersProfile,
  resolveWorkspaceDestinationPath,
  type CampusTransitionRequest,
  type CampusTransitionSpeed,
  type CampusTransitionState,
} from '../../../../studio-os-core/campus-transitions';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { CampusTransitionOverlay } from './CampusTransitionOverlay';

export type TravelToWorkspaceOptions = {
  missionControl?: boolean;
  showBriefing?: boolean;
  registryById?: Set<string>;
};

export type CampusTransitionContextValue = {
  state: CampusTransitionState;
  speed: CampusTransitionSpeed;
  travelToWorkspace: (workspaceId: string, options?: TravelToWorkspaceOptions) => void;
  returnToCampus: () => void;
  completeTransition: () => void;
};

const CampusTransitionContext = createContext<CampusTransitionContextValue | null>(null);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Props = { children: ReactNode };

export function CampusTransitionProvider({ children }: Props) {
  const navigate = useNavigate();
  const { enterWorkspace, workspaceId: currentWorkspaceId } = useWorkspace();
  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);

  const [speed, setSpeed] = useState<CampusTransitionSpeed>(() => readCampusTransitionSpeed());
  const [state, setState] = useState<CampusTransitionState>({
    active: false,
    phase: 'idle',
    request: null,
    profile: null,
    briefing: null,
    briefingExpanded: false,
  });

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const resetState = useCallback(() => {
    setState({
      active: false,
      phase: 'idle',
      request: null,
      profile: null,
      briefing: null,
      briefingExpanded: false,
    });
  }, []);

  const finishArrival = useCallback(
    (request: CampusTransitionRequest) => {
      clearTimers();
      enterWorkspace(request.workspaceId);
      navigate(request.destinationPath);
      resetState();
    },
    [clearTimers, enterWorkspace, navigate, resetState]
  );

  const completeTransition = useCallback(() => {
    const request = state.request;
    if (!request) {
      resetState();
      return;
    }
    if (request.kind === 'departure') {
      clearTimers();
      navigate(STUDIO_OS_ROUTES.entry);
      resetState();
      return;
    }
    finishArrival(request);
  }, [state.request, clearTimers, navigate, resetState, finishArrival]);

  const runArrivalSequence = useCallback(
    async (request: CampusTransitionRequest, activeSpeed: CampusTransitionSpeed) => {
      const runId = ++runIdRef.current;
      const durations = campusTransitionDurations(activeSpeed);
      const profile = resolveHeadquartersProfile(request.workspaceId);
      const briefing = buildCampusArrivalBriefing(request.workspaceId);
      const showBriefing = request.showBriefing !== false;

      if (activeSpeed === 'instant') {
        enterWorkspace(request.workspaceId);
        navigate(request.destinationPath);
        return;
      }

      setState({
        active: true,
        phase: 'departing',
        request,
        profile,
        briefing,
        briefingExpanded: false,
      });

      await sleep(durations.departing);
      if (runId !== runIdRef.current) return;

      setState((s) => ({ ...s, phase: 'traveling' }));
      await sleep(durations.traveling);
      if (runId !== runIdRef.current) return;

      setState((s) => ({ ...s, phase: 'revealing' }));
      await sleep(durations.revealing);
      if (runId !== runIdRef.current) return;

      setState((s) => ({ ...s, phase: 'concierge' }));
      await sleep(durations.concierge);
      if (runId !== runIdRef.current) return;

      if (showBriefing) {
        setState((s) => ({ ...s, phase: 'briefing' }));
        return;
      }

      finishArrival(request);
    },
    [enterWorkspace, navigate, finishArrival]
  );

  const runDepartureSequence = useCallback(
    async (activeSpeed: CampusTransitionSpeed) => {
      const runId = ++runIdRef.current;
      const durations = campusTransitionDurations(activeSpeed);
      const profile = resolveHeadquartersProfile(currentWorkspaceId);

      if (activeSpeed === 'instant') {
        navigate(STUDIO_OS_ROUTES.entry);
        return;
      }

      const request: CampusTransitionRequest = {
        workspaceId: currentWorkspaceId,
        destinationPath: STUDIO_OS_ROUTES.entry,
        kind: 'departure',
        fromWorkspaceId: currentWorkspaceId,
      };

      setState({
        active: true,
        phase: 'exiting',
        request,
        profile,
        briefing: null,
        briefingExpanded: false,
      });

      await sleep(durations.exiting);
      if (runId !== runIdRef.current) return;

      setState((s) => ({ ...s, phase: 'returning' }));
      await sleep(durations.returning);
      if (runId !== runIdRef.current) return;

      navigate(STUDIO_OS_ROUTES.entry);
      resetState();
    },
    [currentWorkspaceId, navigate, resetState]
  );

  const travelToWorkspace = useCallback(
    (targetWorkspaceId: string, options: TravelToWorkspaceOptions = {}) => {
      clearTimers();
      ++runIdRef.current;
      const activeSpeed = readCampusTransitionSpeed();
      setSpeed(activeSpeed);

      const destinationPath = resolveWorkspaceDestinationPath(targetWorkspaceId, {
        missionControl: options.missionControl,
        registryById: options.registryById,
      });

      const request: CampusTransitionRequest = {
        workspaceId: targetWorkspaceId,
        destinationPath,
        kind: 'arrival',
        showBriefing: options.showBriefing ?? true,
        fromWorkspaceId: currentWorkspaceId,
      };

      if (targetWorkspaceId === currentWorkspaceId && activeSpeed === 'instant') {
        navigate(destinationPath);
        return;
      }

      if (targetWorkspaceId === currentWorkspaceId && activeSpeed !== 'instant') {
        void runArrivalSequence({ ...request, showBriefing: options.showBriefing ?? false }, activeSpeed);
        return;
      }

      void runArrivalSequence(request, activeSpeed);
    },
    [clearTimers, currentWorkspaceId, navigate, runArrivalSequence]
  );

  const returnToCampus = useCallback(() => {
    clearTimers();
    ++runIdRef.current;
    const activeSpeed = readCampusTransitionSpeed();
    setSpeed(activeSpeed);
    void runDepartureSequence(activeSpeed);
  }, [clearTimers, runDepartureSequence]);

  const onBeginDay = useCallback(() => {
    const request = state.request;
    if (!request || request.kind !== 'arrival') return;
    finishArrival(request);
  }, [state.request, finishArrival]);

  const onSkipToMissionControl = useCallback(() => {
    const request = state.request;
    if (!request || request.kind !== 'arrival') return;
    const mcPath = resolveWorkspaceDestinationPath(request.workspaceId, { missionControl: true });
    finishArrival({ ...request, destinationPath: mcPath });
  }, [state.request, finishArrival]);

  const value = useMemo<CampusTransitionContextValue>(
    () => ({
      state,
      speed,
      travelToWorkspace,
      returnToCampus,
      completeTransition,
    }),
    [state, speed, travelToWorkspace, returnToCampus, completeTransition]
  );

  return (
    <CampusTransitionContext.Provider value={value}>
      {children}
      <CampusTransitionOverlay
        active={state.active}
        phase={state.phase}
        request={state.request}
        profile={state.profile}
        briefing={state.briefing}
        briefingExpanded={state.briefingExpanded}
        speed={speed}
        onToggleBriefingExpand={() => setState((s) => ({ ...s, briefingExpanded: !s.briefingExpanded }))}
        onBeginDay={onBeginDay}
        onSkipToMissionControl={onSkipToMissionControl}
      />
    </CampusTransitionContext.Provider>
  );
}

export function useCampusTransition(): CampusTransitionContextValue {
  const ctx = useContext(CampusTransitionContext);
  if (!ctx) {
    throw new Error('useCampusTransition must be used within CampusTransitionProvider');
  }
  return ctx;
}
