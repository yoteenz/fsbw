/** Map a viewport `DOMRect` into coordinates relative to a scene measure element. */
export function domRectRelativeToContainer(
  rect: DOMRect,
  container: HTMLElement,
): { left: number; top: number; width: number; height: number } {
  const c = container.getBoundingClientRect();
  return {
    left: rect.left - c.left,
    top: rect.top - c.top,
    width: rect.width,
    height: rect.height,
  };
}
