# AIO icon sheet → vector sprite

Source: `docs/migration-recovery/icon-sheet/aio-icon-sheet-source.png` (founder-supplied icon sheet).

```
pip install potracer opencv-python-headless numpy pillow
python3 segment.py      # 79 named glyph boxes (sheet order, labels as drawn)
python3 trace.py        # potrace each glyph (10× upsample, per-icon ink normalisation) + derived glyphs
python3 gen_sprite.py   # public/migration/icons/aio-icon-sheet.svg + src/client-migration/visual/aioIconSheet.ts
```

Each symbol is a 56×56 sheet-px window centred on its glyph, so the sheet's relative scale is kept.
Derived glyphs: `arrow-right` (the up-arrow from `migrate`, rotated), `info-mark` / `help-mark` / `alert-mark`
(inner marks of `info-log` / `help` / `error-log`). Intermediates go to `.build/` (ignored).
