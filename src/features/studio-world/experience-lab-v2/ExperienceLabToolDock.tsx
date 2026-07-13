import { BOTTOM_TOOL_DOCK_ITEMS, MOBILE_PRIMARY_DOCK_IDS } from './experience-lab-v2.config';

type Props = {
  isMobile?: boolean;
  activeId?: string;
};

export function ExperienceLabToolDock({ isMobile = false, activeId = 'experience-lab' }: Props) {
  const items = isMobile
    ? BOTTOM_TOOL_DOCK_ITEMS.filter((i) => (MOBILE_PRIMARY_DOCK_IDS as readonly string[]).includes(i.id))
    : BOTTOM_TOOL_DOCK_ITEMS;

  return (
    <nav className="elab-v2__tool-dock" aria-label="Department tool dock" data-elab-tool-dock>
      {items.map((item) => (
        <button key={item.id} type="button" className="elab-v2__tool-btn" data-active={item.id === activeId || ('active' in item && item.active)}>
          {item.label}
        </button>
      ))}
      {isMobile ? (
        <button type="button" className="elab-v2__tool-btn">
          More
        </button>
      ) : null}
    </nav>
  );
}
