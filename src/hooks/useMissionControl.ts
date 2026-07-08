import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ACTIVATION_PHASES,
  activationPhaseDuration,
  activationStateForPhase,
  buildActivationOrbLine,
  buildConstellationStars,
  buildMissionControlDestinationLines,
  buildMissionControlModeLine,
  buildMissionControlWelcomeLines,
  buildTravelPreview,
  formatWorldHealthAmbient,
  initialActivationState,
  MISSION_CONTROL_MODE_LABELS,
  MISSION_CONTROL_MODES,
  MISSION_CONTROL_TRAVEL_LABELS,
  MISSION_CONTROL_TRAVEL_OPTIONS,
  nextActivationPhase,
  resolveAtlasModeFromMissionControl,
  resolveAtlasTravelFromMissionOption,
  resolveContinuousScaleFromNode,
  resolveMissionControlModeFromAtlas,
  resolveModeMapping,
  resolveWorldHealthSignals,
  shouldShowNavigation,
  summarizeConstellationNavigation,
  type MissionControlMode,
  type MissionControlOrbLine,
  type MissionControlTravelOption,
} from '../studio-os-core/mission-control';
import type { AtlasNode } from '../studio-os-core/studio-world-atlas/types';
import type { AtlasTravelResolution } from '../studio-os-core/studio-world-atlas/fast-travel';

export function useMissionControl(options: {
  visibleNodes: AtlasNode[];
  focusNode: AtlasNode;
  atlasMapMode: string;
  setMapMode: (mode: ReturnType<typeof resolveAtlasModeFromMissionControl>) => void;
  setTravelMode: (mode: ReturnType<typeof resolveAtlasTravelFromMissionOption>) => void;
  resolveTravel: (nodeId: string) => AtlasTravelResolution | null;
  selectedNode: AtlasNode;
  skipActivation?: boolean;
}) {
  const {
    visibleNodes,
    focusNode,
    atlasMapMode,
    setMapMode,
    setTravelMode,
    resolveTravel,
    selectedNode,
    skipActivation = false,
  } = options;

  const [activation, setActivation] = useState(() =>
    skipActivation ? activationStateForPhase('navigation-ready') : initialActivationState()
  );
  const [missionMode, setMissionMode] = useState<MissionControlMode>(() =>
    resolveMissionControlModeFromAtlas(atlasMapMode as Parameters<typeof resolveMissionControlModeFromAtlas>[0])
  );
  const [orbLines, setOrbLines] = useState<MissionControlOrbLine[]>(() => buildMissionControlWelcomeLines());
  const [travelOption, setTravelOption] = useState<MissionControlTravelOption>('walk');

  useEffect(() => {
    if (skipActivation || activation.ready) return;

    let cancelled = false;
    let phaseIdx = 0;

    const runPhase = () => {
      if (cancelled || phaseIdx >= ACTIVATION_PHASES.length) return;
      const phase = ACTIVATION_PHASES[phaseIdx]!;
      setActivation(activationStateForPhase(phase));
      setOrbLines([buildActivationOrbLine(phase)]);
      phaseIdx += 1;
      const next = ACTIVATION_PHASES[phaseIdx];
      if (next) {
        window.setTimeout(runPhase, activationPhaseDuration(phase));
      } else {
        window.setTimeout(() => {
          if (!cancelled) setOrbLines(buildMissionControlWelcomeLines());
        }, activationPhaseDuration(phase));
      }
    };

    runPhase();
    return () => {
      cancelled = true;
    };
  }, [skipActivation, activation.ready]);

  const modeMapping = useMemo(() => resolveModeMapping(missionMode), [missionMode]);

  const constellationStars = useMemo(
    () => buildConstellationStars(visibleNodes, focusNode.level),
    [visibleNodes, focusNode.level]
  );

  const worldHealth = useMemo(() => resolveWorldHealthSignals(visibleNodes), [visibleNodes]);
  const worldHealthLine = useMemo(() => formatWorldHealthAmbient(worldHealth), [worldHealth]);

  const continuousScale = useMemo(
    () => resolveContinuousScaleFromNode(focusNode),
    [focusNode]
  );

  const travelPreview = useMemo(() => {
    const resolution = resolveTravel(selectedNode.id);
    return buildTravelPreview(selectedNode, resolution, []);
  }, [selectedNode, resolveTravel]);

  const selectMissionMode = useCallback(
    (mode: MissionControlMode) => {
      setMissionMode(mode);
      setMapMode(resolveAtlasModeFromMissionControl(mode));
      setOrbLines([buildMissionControlModeLine(MISSION_CONTROL_MODE_LABELS[mode])]);
    },
    [setMapMode]
  );

  const selectTravelOption = useCallback(
    (option: MissionControlTravelOption) => {
      setTravelOption(option);
      setTravelMode(resolveAtlasTravelFromMissionOption(option));
    },
    [setTravelMode]
  );

  const focusDestination = useCallback((nodeId: string) => {
    void nodeId;
    setOrbLines(buildMissionControlDestinationLines(selectedNode.displayName));
  }, [selectedNode.displayName]);

  const navigationReady = shouldShowNavigation(activation);

  return {
    activation,
    navigationReady,
    missionMode,
    modeMapping,
    constellationStars,
    constellationSummary: summarizeConstellationNavigation(constellationStars),
    worldHealth,
    worldHealthLine,
    continuousScale,
    travelPreview,
    travelOption,
    orbLines,
    selectMissionMode,
    selectTravelOption,
    missionModes: MISSION_CONTROL_MODES,
    travelOptions: MISSION_CONTROL_TRAVEL_OPTIONS,
    travelLabels: MISSION_CONTROL_TRAVEL_LABELS,
    modeLabels: MISSION_CONTROL_MODE_LABELS,
    focusDestination,
    replayActivation: useCallback(() => {
      setActivation(initialActivationState());
      const advance = (phase: (typeof ACTIVATION_PHASES)[number]) => {
        const n = nextActivationPhase(phase);
        if (!n) {
          setActivation(activationStateForPhase('navigation-ready'));
          setOrbLines(buildMissionControlWelcomeLines());
          return;
        }
        setActivation(activationStateForPhase(n));
        setOrbLines([buildActivationOrbLine(n)]);
        window.setTimeout(() => advance(n), activationPhaseDuration(n));
      };
      window.setTimeout(() => advance('darkening'), activationPhaseDuration('darkening'));
    }, []),
  };
}
