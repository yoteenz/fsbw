"""Derive the IFTA hero / media plates from the APPROVED authority boards (no generation, no stock).

  python3 -I scripts/ifta/derive-ifta-authority-plates.py <SITE00>/docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE public/brand/ifta/plates [preview_dir]

Each plate is the photographic region of one authority screen, cut at the screen's own geometry. The UI baked into
the image (headline, pills, panels, metrics rail) is removed with OpenCV inpainting; the live UI is then laid over the
same geometry, so nothing interactive is a picture. Deterministic for a given OpenCV build (made with
opencv-python-headless 5.0.0). Box = board pixels; css = the CSS size the region maps to at the authority width.
"""
import sys, os, json
import numpy as np, cv2

BUNDLE, OUT = sys.argv[1], sys.argv[2]
PREVIEW = sys.argv[3] if len(sys.argv) > 3 else None
CLIENT = '02_CLIENT_MODE/AIO_IFTA_CLIENT_TABLET_DESKTOP.jpeg'
PARENT = '02_CLIENT_MODE/AIO_IFTA_CLIENT_MOBILE_PARENT_AUTHORITY.jpeg'
STAFF = '03_FOUNDER_STAFF_MODE/AIO_IFTA_FOUNDER_STAFF_TABLET_DESKTOP.jpeg'
PUBLIC = '04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg'
MOBILE3 = '01_TERRITORY_SELECTION/AIO_IFTA_3_ACTOR_MODES_MOBILE.jpeg'

# name: (source, board box, css size, output width, masks[(mode, x0, y0, x1, y1) in css px of the plate])
PLATES = {
  'client-hero-desktop': (CLIENT, (522, 161, 1411, 371), (1440, 340), 2160, [
      ('dark', 30, 25, 330, 235), ('solid', 326, 186, 540, 242), ('solid', 1170, 172, 1424, 318), ('solid', 20, 254, 1044, 340)]),
  'client-hero-tablet': (CLIENT, (44, 155, 477, 371), (834, 416), 1251, [
      ('dark', 36, 30, 345, 252), ('solid', 36, 252, 274, 318), ('solid', 8, 332, 828, 416)]),
  'client-hero-mobile': (PARENT, (0, 0, 1206, 645), (402, 215), 1206, [
      ('dark', 18, 2, 60, 30), ('dark', 286, 0, 392, 32), ('dark', 18, 38, 172, 138), ('solid', 18, 139, 122, 168), ('solid', 12, 167, 392, 215)]),
  'staff-hero-desktop': (STAFF, (608, 226, 1411, 401), (1440, 314), 2160, [
      ('dark', 34, 20, 365, 244), ('solid', 36, 244, 254, 306), ('solid', 1044, 16, 1426, 290), ('solid', 10, 306, 1430, 314)]),
  'staff-hero-tablet': (STAFF, (39, 229, 556, 406), (1024, 351), 1536, [
      ('dark', 40, 22, 404, 274), ('solid', 40, 272, 284, 340), ('solid', 634, 70, 1010, 348)]),
  'staff-hero-mobile': (MOBILE3, (514, 56, 1023, 271), (402, 170), 1206, [
      ('dark', 20, 10, 182, 132), ('solid', 22, 128, 128, 160), ('solid', 266, 42, 396, 166)]),
  'public-hero-desktop': (PUBLIC, (516, 73, 1433, 335), (1440, 412), 2160, [
      ('light', 64, 28, 478, 324), ('solid', 62, 322, 420, 396)]),
  'public-hero-tablet': (PUBLIC, (27, 97, 486, 319), (834, 403), 1251, [
      ('light', 26, 40, 430, 312), ('solid', 26, 310, 346, 384)]),
  'public-hero-mobile': (MOBILE3, (1032, 55, 1536, 307), (402, 201), 1206, [
      ('light', 18, 32, 186, 160), ('solid', 18, 158, 160, 191)]),
  'public-road': (PUBLIC, (931, 418, 1431, 595), (789, 280), 1184, [
      ('light', 50, 96, 372, 218), ('solid', 50, 222, 142, 242)]),
  'public-map-desktop': (PUBLIC, (547, 784, 789, 904), (380, 188), 760, []),
  'public-map': (PUBLIC, (37, 633, 310, 766), (497, 242), 994, []),
  'public-footer-desktop': (PUBLIC, (517, 917, 1431, 1011), (1440, 155), 2160, [
      ('solid', 110, 36, 212, 122), ('light', 104, 34, 700, 132), ('light', 960, 70, 1380, 140)]),
  'public-footer-tablet': (PUBLIC, (29, 893, 484, 1002), (834, 203), 1251, [
      ('solid', 250, 76, 352, 150), ('light', 150, 64, 690, 190)]),
  'client-insights': (CLIENT, (1160, 887, 1395, 952), (381, 105), 762, [
      ('dark', 66, 0, 360, 60)]),
}

def text_mask(img, rect, mode):
    x0, y0, x1, y1 = rect
    roi = img[y0:y1, x0:x1]
    g = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY).astype(np.int16)
    k = max(15, (min(roi.shape[:2]) // 3) | 1)
    bg = cv2.medianBlur(cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY), min(k, 255 if k < 255 else 255) if k % 2 else k + 1).astype(np.int16)
    if mode == 'dark':
        m = (g < bg - 28) | (g < 70)
    else:
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        m = (g > bg + 30) | (g > 200) | ((hsv[..., 1] > 90) & (hsv[..., 2] > 170) & (g > bg + 15))
    m = m.astype(np.uint8) * 255
    return m

def build(name, spec):
    src, box, css, out_w, masks = spec
    img = cv2.imread(os.path.join(BUNDLE, src))
    x0, y0, x1, y1 = box
    plate = img[y0:y1, x0:x1].copy()
    ph, pw = plate.shape[:2]
    sx, sy = pw / css[0], ph / css[1]
    mask = np.zeros((ph, pw), np.uint8)
    for mode, a, b, c, d in masks:
        r = (max(0, int(a * sx)), max(0, int(b * sy)), min(pw, int(round(c * sx))), min(ph, int(round(d * sy))))
        if r[2] <= r[0] or r[3] <= r[1]:
            continue
        if mode == 'solid':
            mask[r[1]:r[3], r[0]:r[2]] = 255
        else:
            m = text_mask(plate, r, mode)
            mask[r[1]:r[3], r[0]:r[2]] |= m
    if mask.any():
        mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=1)
        plate = cv2.inpaint(plate, mask, 6, cv2.INPAINT_TELEA)
    # JPEG block clean-up, then a two-step Lanczos upscale with a gentle unsharp mask.
    plate = cv2.fastNlMeansDenoisingColored(plate, None, 3, 3, 5, 15)
    out_h = round(out_w * css[1] / css[0])
    mid = cv2.resize(plate, (round((pw + out_w) / 2), round((ph + out_h) / 2)), interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(mid, (0, 0), 1.2)
    mid = cv2.addWeighted(mid, 1.45, blur, -0.45, 0)
    final = cv2.resize(mid, (out_w, out_h), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(os.path.join(OUT, f'{name}.jpg'), final, [cv2.IMWRITE_JPEG_QUALITY, 84, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
    if PREVIEW:
        vis = img[y0:y1, x0:x1].copy(); vis[mask > 0] = (0, 0, 255)
        cv2.imwrite(os.path.join(PREVIEW, f'{name}-mask.png'), vis)
    return {'name': name, 'source': src, 'box': box, 'css': css, 'out': [out_w, out_h], 'masks': len(masks)}

os.makedirs(OUT, exist_ok=True)
if PREVIEW: os.makedirs(PREVIEW, exist_ok=True)
print(json.dumps([build(k, v) for k, v in PLATES.items()], indent=1))
