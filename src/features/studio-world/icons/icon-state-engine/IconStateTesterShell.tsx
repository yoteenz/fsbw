import { useMemo, useState } from 'react';
import {
  STUDIO_WORLD_ICON_STATES,
  STUDIO_WORLD_ICON_THEMES,
  ICON_STATE_DEVICES,
  ICON_ANIMATION_PRESETS,
  type StudioWorldIconProceduralState,
  type StudioWorldIconTheme,
  type IconStateDevice,
  type IconAnimationPreset,
} from '../../../../studio-os-core/icon-state-engine';
import { StudioWorldIconProvider, useStudioWorldIconSystem } from '../StudioWorldIconProvider';
import { StudioIcon } from './StudioIcon';
import './icon-state-qa.css';

const SAMPLE_ICON_IDS = ['search', 'blueprint', 'camera', 'settings', 'orbit'];

function TesterBody() {
  const { manifest } = useStudioWorldIconSystem();
  const iconIds = useMemo(() => {
    const fromManifest = manifest?.icons?.map((i) => i.id).slice(0, 12) ?? [];
    return fromManifest.length > 0 ? fromManifest : SAMPLE_ICON_IDS;
  }, [manifest]);

  const [iconId, setIconId] = useState(iconIds[0] ?? 'search');
  const [state, setState] = useState<StudioWorldIconProceduralState>('default');
  const [theme, setTheme] = useState<StudioWorldIconTheme>('studio-dark');
  const [device, setDevice] = useState<IconStateDevice>('desktop');
  const [size, setSize] = useState(48);
  const [animated, setAnimated] = useState(true);
  const [animation, setAnimation] = useState<IconAnimationPreset>('none');

  const runtimeJson = useMemo(
    () =>
      JSON.stringify(
        {
          iconId,
          state,
          theme,
          device,
          size,
          animated,
          animation,
        },
        null,
        2
      ),
    [iconId, state, theme, device, size, animated, animation]
  );

  return (
    <div className="swi-qa">
      <header className="swi-qa__header">
        <h1>Icon State Engine — Live State Tester</h1>
        <p>QA only — procedural rendering from one certified icon. No production UI changes.</p>
      </header>

      <div className="swi-qa__layout">
        <section className="swi-qa__preview">
          <div className={`swi-qa__stage swi-qa__stage--${theme}`}>
            <StudioIcon
              id={iconId}
              state={state}
              theme={theme}
              size={size}
              device={device}
              animated={animated}
              label={`${iconId} ${state}`}
            />
          </div>
          <p className="swi-qa__caption">
            {iconId} · {state} · {theme} · {device} · {size}px
          </p>
        </section>

        <section className="swi-qa__controls">
          <label>
            Icon
            <select value={iconId} onChange={(e) => setIconId(e.target.value)}>
              {iconIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>

          <label>
            State
            <select value={state} onChange={(e) => setState(e.target.value as StudioWorldIconProceduralState)}>
              {STUDIO_WORLD_ICON_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label>
            Theme
            <select value={theme} onChange={(e) => setTheme(e.target.value as StudioWorldIconTheme)}>
              {STUDIO_WORLD_ICON_THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Device
            <select value={device} onChange={(e) => setDevice(e.target.value as IconStateDevice)}>
              {ICON_STATE_DEVICES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label>
            Size ({size}px)
            <input
              type="range"
              min={16}
              max={64}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>

          <label>
            Animation preset (reference)
            <select value={animation} onChange={(e) => setAnimation(e.target.value as IconAnimationPreset)}>
              {ICON_ANIMATION_PRESETS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label className="swi-qa__checkbox">
            <input type="checkbox" checked={animated} onChange={(e) => setAnimated(e.target.checked)} />
            Animated
          </label>
        </section>

        <section className="swi-qa__inspect">
          <h2>Runtime output</h2>
          <textarea readOnly value={runtimeJson} className="swi-qa__json" />
        </section>
      </div>
    </div>
  );
}

export function IconStateTesterShell() {
  return (
    <StudioWorldIconProvider>
      <TesterBody />
    </StudioWorldIconProvider>
  );
}
