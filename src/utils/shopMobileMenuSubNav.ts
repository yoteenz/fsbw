import type { NavigateFunction } from 'react-router-dom';
import { bookingAppointmentHref, bookingConsultationHref } from './bookingMemberRoutes';

/** Handles SHOP tab expandable rows: UNITS, HD LACE, and BOOKING sub-links. */
export function navigateShopMenuSubItem(
  navigate: NavigateFunction,
  parentLabel: string,
  subItem: string,
  options?: { closeMenu?: () => void }
): void {
  const close = options?.closeMenu;
  if (parentLabel === 'UNITS') {
    if (subItem === 'STRAIGHT') navigate('/units/straight');
    else if (subItem === 'WAVY') navigate('/units/wavy');
    else if (subItem === 'CURLY') navigate('/units/curly');
    else return;
    close?.();
    return;
  }
  if (parentLabel === 'HD LACE') {
    if (subItem === 'CLOSURES') navigate('/shop/closures');
    else if (subItem === 'FRONTALS') navigate('/shop/frontals');
    else return;
    close?.();
    return;
  }
  if (parentLabel === 'BOOKING') {
    if (subItem === 'APPOINTMENT') navigate(bookingAppointmentHref());
    else if (subItem === 'CONSULTATION') navigate(bookingConsultationHref());
    else return;
    close?.();
  }
}
