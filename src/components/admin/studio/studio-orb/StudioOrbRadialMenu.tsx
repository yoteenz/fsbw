import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHeroObject } from '../../../../studio-os-core/hero-objects/catalog';
import {
  orbDisplaySlotKey,
  orbDisplaySlotLabel,
  resolveHeroObjectOrbAction,
  type OrbDisplaySlot,
} from '../../../../studio-os-core/hero-objects';
import {
  HeroObjectRenderer,
  HERO_OBJECT_ORB_SCULPTURE_PX,
} from '../hero-objects';
import {
  computeRadialMenuLayout,
  measureOrbCenterFromDom,
  readViewportRect,
  type RadialMenuLayout,
} from './studioOrbRadialLayout';
import { useStudioOrb } from './StudioOrbProvider';
import { useGlobalAtlasLayerOptional } from '../global-atlas';
import { StudioOrbProjectionItem } from './StudioOrbProjectionItem';

type Props = {
  orbCenterX: number;
  orbCenterY: number;
};

const CONTEXT_TRANSITION_DISSOLVE_MS = 380;
const CONTEXT_TRANSITION_MATERIALIZE_MS = 580;

/** Contextual Orb™ — floating Hero Objects retrieved from Studio Foundry™. */
export function StudioOrbRadialMenu({ orbCenterX, orbCenterY }: Props) {
  const navigate = useNavigate();
  const {
    radialOpen,
    closeRadial,
    openCommandDock,
    openPageGuide,
    openLifeCulture,
    openVoiceMode,
    openRecommendations,
    orbToolbelt,
    orbContextTransition,
  } = useStudioOrb();
  const globalAtlas = useGlobalAtlasLayerOptional();

  const slots = orbToolbelt.slots;
  const slotCount = slots.length;

  const [displaySlots, setDisplaySlots] = useState<OrbDisplaySlot[]>(slots);
  const [dismissingKeys, setDismissingKeys] = useState<Set<string>>(new Set());
  const [materializing, setMaterializing] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const transitionTimer = useRef<number | null>(null);

  const [layout, setLayout] = useState<RadialMenuLayout>(() =>
    computeRadialMenuLayout(orbCenterX, orbCenterY, Math.max(slotCount, 1))
  );

  const refreshLayout = useCallback(() => {
    const measured = measureOrbCenterFromDom();
    const ax = measured?.x ?? orbCenterX;
    const ay = measured?.y ?? orbCenterY;
    setLayout(
      computeRadialMenuLayout(ax, ay, Math.max(displaySlots.length, 1), readViewportRect())
    );
  }, [displaySlots.length, orbCenterX, orbCenterY]);

  useLayoutEffect(() => {
    if (!radialOpen) return;
    refreshLayout();

    const vv = window.visualViewport;
    const onViewportChange = () => refreshLayout();
    vv?.addEventListener('resize', onViewportChange);
    vv?.addEventListener('scroll', onViewportChange);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);

    return () => {
      vv?.removeEventListener('resize', onViewportChange);
      vv?.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('orientationchange', onViewportChange);
    };
  }, [radialOpen, refreshLayout, displaySlots.length]);

  useEffect(() => {
    if (!radialOpen) {
      setDisplaySlots(slots);
      setDismissingKeys(new Set());
      setMaterializing(false);
      setSelectedKey(null);
      return;
    }

    const prevKeys = new Set(displaySlots.map((s, i) => orbDisplaySlotKey(s, i)));
    const nextKeys = new Set(slots.map((s, i) => orbDisplaySlotKey(s, i)));
    const unchanged =
      prevKeys.size === nextKeys.size && [...prevKeys].every((k) => nextKeys.has(k));

    if (unchanged || orbContextTransition === 'idle') {
      setDisplaySlots(slots);
      return;
    }

    if (orbContextTransition === 'dissolving') {
      setDismissingKeys(new Set(displaySlots.map((s, i) => orbDisplaySlotKey(s, i))));
      if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
      transitionTimer.current = window.setTimeout(() => {
        setDisplaySlots(slots);
        setDismissingKeys(new Set());
        setMaterializing(true);
        transitionTimer.current = window.setTimeout(() => setMaterializing(false), CONTEXT_TRANSITION_MATERIALIZE_MS);
      }, CONTEXT_TRANSITION_DISSOLVE_MS);
    }
  }, [slots, radialOpen, orbContextTransition, displaySlots]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    };
  }, []);

  const contextLabel = useMemo(() => orbToolbelt.contextLabel, [orbToolbelt.contextLabel]);

  if (!radialOpen) return null;

  const runSurface = (surface: string) => {
    if (surface === 'world-atlas') {
      globalAtlas?.openAtlas();
      closeRadial();
    } else if (surface === 'command-dock') openCommandDock();
    else if (surface === 'daily-brief') openRecommendations();
    else if (surface === 'page-guide') openPageGuide();
    else if (surface === 'life-culture') openLifeCulture();
    else if (surface === 'voice') openVoiceMode();
    else closeRadial();
  };

  const handleSlot = (slot: OrbDisplaySlot, key: string) => {
    setSelectedKey(key);

    window.setTimeout(() => {
      if (slot.kind === 'context-action') {
        runSurface(slot.action.surface);
        return;
      }

      const heroId = slot.kind === 'hero-object' ? slot.heroObjectId : '';
      const definition = getHeroObject(heroId);
      const action = resolveHeroObjectOrbAction(heroId, definition?.destinationPath);

      if (action.kind === 'surface') {
        runSurface(action.surface);
      } else {
        navigate(action.path);
        closeRadial();
      }
    }, 180);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close Studio Orb projections"
        className="fixed inset-0 z-[100045]"
        style={{ background: 'transparent', border: 'none', cursor: 'default' }}
        onClick={closeRadial}
      />
      <div
        className={`fixed z-[100049] pointer-events-none studio-orb-radial-menu-root${
          materializing ? ' is-context-materializing' : ''
        }${orbContextTransition === 'dissolving' ? ' is-context-dissolving' : ''}`}
        aria-label={`Studio Orb — ${contextLabel}`}
        role="menu"
        data-layout={layout.mode}
        data-orb-context={orbToolbelt.contextId}
      >
        {displaySlots.map((slot, index) => {
          const pos = layout.items[index];
          if (!pos) return null;
          const key = orbDisplaySlotKey(slot, index);
          const label = orbDisplaySlotLabel(slot);
          const dismissing = dismissingKeys.has(key);
          const selected = selectedKey === key;

          return (
            <StudioOrbProjectionItem
              key={key}
              label={label}
              icon={
                slot.kind === 'hero-object' ? (
                  <HeroObjectRenderer heroObjectId={slot.heroObjectId} size={HERO_OBJECT_ORB_SCULPTURE_PX} selected={selected} />
                ) : (
                  <HeroObjectRenderer
                    contextActionId={slot.action.id}
                    contextActionHeroObjectId={slot.action.heroObjectId}
                    size={HERO_OBJECT_ORB_SCULPTURE_PX}
                    selected={selected}
                  />
                )
              }
              index={index}
              style={{
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => handleSlot(slot, key)}
              dismissing={dismissing}
              selected={selected}
            />
          );
        })}
      </div>
    </>
  );
}

/** Future expansion — full radial ring (disabled items visible as ghost nodes). */
export function StudioOrbRadialMenuFutureHint() {
  return null;
}
