import type { EnterMenuIconId } from '../config/directory';
import { Site00AccountIcon } from './Site00AccountIcon';
import { Site00BldrStudioIcon } from './Site00BldrStudioIcon';
import { Site00CrosshairIcon } from './Site00CrosshairIcon';
import { SITE00_ICON_DEFAULT_SIZE } from './site00IconGeometry';
import { Site00ProjectsIcon } from './Site00ProjectsIcon';

const ENTER_MENU_ICONS: Record<EnterMenuIconId, typeof Site00BldrStudioIcon> = {
  'bldr-studio': Site00BldrStudioIcon,
  projects: Site00ProjectsIcon,
  account: Site00AccountIcon,
  idnty: Site00AccountIcon,
  'ctrl-room': Site00CrosshairIcon,
  'my-sites': Site00ProjectsIcon,
};

type EnterMenuIconProps = {
  id: EnterMenuIconId;
  size?: number;
  className?: string;
};

export function EnterMenuIcon({ id, size = SITE00_ICON_DEFAULT_SIZE, className }: EnterMenuIconProps) {
  const Icon = ENTER_MENU_ICONS[id];
  return <Icon size={size} className={className} />;
}
