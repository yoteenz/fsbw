"""Segment the founder icon sheet into named glyph boxes → glyphs.json"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SHEET = os.path.join(HERE, '..', '..', 'docs', 'migration-recovery', 'icon-sheet', 'aio-icon-sheet-source.png')
BUILD = os.path.join(HERE, '.build')
os.makedirs(BUILD, exist_ok=True)
import json
import numpy as np, cv2
from PIL import Image, ImageDraw
NAMES = [
 'back forward home inbox explore copilot more close dropdown collapse menu repo settings',
 'success failure skipped pending running queued warning info pass fail blocked skipped-small more-small',
 'run stop re-run add remove edit delete download upload open-link copy view search',
 'setup checkout build install database security migrate connectivity api-keys tests summary artifact deploy',
 'home-active home-inactive inbox-tab explore-tab copilot-tab battery signal wifi repo-small profile help notification calendar filter',
 'log code image pdf text terminal folder search-file error-log info-log success-log time-log line-number',
]
BANDS = [(60, 117), (226, 285), (398, 456), (571, 632), (754, 811), (912, 970)]
im = np.asarray(Image.open(SHEET).convert('RGB')).astype(np.int32)
ink = (255 - im.min(-1))
mask = (ink > 110).astype(np.uint8)
n, lab, st, cen = cv2.connectedComponentsWithStats(mask, 8)
out = {}
dbg = Image.open(SHEET).convert('RGB'); d = ImageDraw.Draw(dbg)
for (y0, y1), names in zip(BANDS, NAMES):
    names = names.split()
    comps = [i for i in range(1, n) if st[i, 4] >= 3 and st[i, 1] >= y0 and st[i, 1] + st[i, 3] <= y1]
    comps.sort(key=lambda i: st[i, 0])
    groups = []
    for i in comps:
        x0, x1 = st[i, 0], st[i, 0] + st[i, 2]
        if groups and x0 - groups[-1]['x1'] < 18:
            g = groups[-1]; g['x1'] = max(g['x1'], x1); g['ids'].append(i)
        else:
            groups.append({'x0': x0, 'x1': x1, 'ids': [i]})
    assert len(groups) == len(names), (y0, len(groups), len(names), [(g['x0'], g['x1']) for g in groups])
    for g, nm in zip(groups, names):
        ys = [st[i, 1] for i in g['ids']]; ye = [st[i, 1] + st[i, 3] for i in g['ids']]
        box = [int(g['x0']), int(min(ys)), int(g['x1']), int(max(ye))]
        out[nm] = {'box': box, 'comps': [[int(v) for v in st[i, :4]] for i in g['ids']]}
        d.rectangle(box, outline=(255, 0, 255)); d.text((box[0], box[3] + 2), nm, fill=(255, 0, 255))
json.dump(out, open(os.path.join(BUILD, 'glyphs.json'), 'w'), indent=0)
dbg.save(os.path.join(BUILD, 'segment-debug.png'))
sizes = sorted((v['box'][2] - v['box'][0], v['box'][3] - v['box'][1], k) for k, v in out.items())
print(len(out), 'glyphs; max w', max(s[0] for s in sizes), 'max h', max(s[1] for s in sizes))
print('smallest', sizes[:4]); print('widest', sorted(sizes, key=lambda s: -s[0])[:4]); print('tallest', sorted(sizes, key=lambda s: -s[1])[:3])
