import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BawTutorialSelections } from '../../../constants/bawTutorialConfig';
import { paintBawSlayCard } from '../../../utils/bawSlayCard';
import { bawStaticMannequinFrontReferencePathFromUnitAndHairline } from '../../../utils/bawStaticMannequinReferencePaths';
import {
  clearBawSlayCardLayoutDebug,
  DEFAULT_BAW_SLAY_CARD_LAYOUT,
  formatBawSlayCardLayoutForCopy,
  loadBawSlayCardLayoutDebug,
  saveBawSlayCardLayoutDebug,
  type BawSlayCardLayout,
  type BawSlayCardTextStyle,
} from '../../../utils/bawSlayCardLayout';

const UNIT_OPTIONS = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'] as const;
const HAIRLINE_OPTIONS = ['NATURAL', 'PEAK', 'LAGOS'] as const;

type SelectableLayer =
  | 'mannequin'
  | 'frontal'
  | 'slayer'
  | 'subtitle'
  | 'unit'
  | 'specs'
  | 'footer';

const SAMPLE_SELECTIONS: BawTutorialSelections = {
  unit: 'BLANCO',
  capSize: 'M',
  length: '24"',
  density: '250%',
  color: 'PLATINUM',
  styling: 'NONE',
};

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="block text-[10px] uppercase tracking-wide mb-1" style={{ fontFamily: '"Futura PT Book"' }}>
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[11px] font-mono"
      />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-[10px] uppercase tracking-wide mb-1" style={{ fontFamily: '"Futura PT Book"' }}>
      {label}
      <div className="mt-0.5 flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 border border-gray-400 p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-gray-400 px-2 py-1 text-[11px] font-mono"
        />
      </div>
    </label>
  );
}

function TextStyleFields({
  style,
  onChange,
  showCenterX = true,
}: {
  style: BawSlayCardTextStyle;
  onChange: (patch: Partial<BawSlayCardTextStyle>) => void;
  showCenterX?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {showCenterX ? (
        <NumberField label="X (center)" value={style.x} onChange={(x) => onChange({ x })} />
      ) : null}
      <NumberField label="Y" value={style.y} onChange={(y) => onChange({ y })} />
      <ColorField label="Color" value={style.color} onChange={(color) => onChange({ color })} />
      <NumberField label="Font size" value={style.fontSize} onChange={(fontSize) => onChange({ fontSize })} />
      <label className="col-span-2 block text-[10px] uppercase tracking-wide mb-1" style={{ fontFamily: '"Futura PT Book"' }}>
        Font family
        <input
          type="text"
          value={style.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[11px] font-mono"
        />
      </label>
      <NumberField
        label="Font weight"
        value={Number(style.fontWeight) || 400}
        onChange={(fontWeight) => onChange({ fontWeight })}
      />
    </div>
  );
}

export default function SlayCardDebugPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<BawSlayCardLayout>(() => loadBawSlayCardLayoutDebug());
  const [selections, setSelections] = useState<BawTutorialSelections>(SAMPLE_SELECTIONS);
  const [hairline, setHairline] = useState('NATURAL');
  const [selectedLayer, setSelectedLayer] = useState<SelectableLayer>('mannequin');
  const [showGuides, setShowGuides] = useState(true);
  const [previewScale, setPreviewScale] = useState(0.45);
  const [copyStatus, setCopyStatus] = useState('');
  const [mannequinBounds, setMannequinBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const dragRef = useRef<{
    layer: SelectableLayer;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originW?: number;
    originH?: number;
  } | null>(null);

  const mannequinSrc = useMemo(
    () => bawStaticMannequinFrontReferencePathFromUnitAndHairline(selections.unit, hairline),
    [selections.unit, hairline]
  );

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = layout.canvasWidth;
    canvas.height = layout.canvasHeight;
    const result = await paintBawSlayCard(ctx, selections, layout, { hairline, mannequinSrc });
    setMannequinBounds(result.mannequinBounds);

    if (showGuides && ctx) {
      ctx.save();
      ctx.strokeStyle = 'rgba(235, 28, 36, 0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(layout.mannequin.x, layout.mannequin.y, layout.mannequin.width, layout.mannequin.height);
      if (result.mannequinBounds) {
        ctx.strokeStyle = 'rgba(0, 120, 255, 0.85)';
        ctx.setLineDash([]);
        ctx.strokeRect(
          result.mannequinBounds.x,
          result.mannequinBounds.y,
          result.mannequinBounds.width,
          result.mannequinBounds.height
        );
      }
      ctx.restore();
    }
  }, [hairline, layout, mannequinSrc, selections, showGuides]);

  useEffect(() => {
    void redraw();
  }, [redraw]);

  useEffect(() => {
    saveBawSlayCardLayoutDebug(layout);
  }, [layout]);

  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const maxW = el.clientWidth - 16;
      const maxH = window.innerHeight - 120;
      const scale = Math.min(maxW / layout.canvasWidth, maxH / layout.canvasHeight, 1);
      setPreviewScale(Math.max(0.2, scale));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout.canvasWidth, layout.canvasHeight]);

  const updateHeader = (key: keyof BawSlayCardLayout['header'], patch: Partial<BawSlayCardTextStyle>) => {
    setLayout((prev) => ({
      ...prev,
      header: { ...prev.header, [key]: { ...prev.header[key], ...patch } },
    }));
  };

  const updateTextPanel = (patch: Partial<BawSlayCardLayout['textPanel']>) => {
    setLayout((prev) => ({ ...prev, textPanel: { ...prev.textPanel, ...patch } }));
  };

  const updateMannequin = (patch: Partial<BawSlayCardLayout['mannequin']>) => {
    setLayout((prev) => ({ ...prev, mannequin: { ...prev.mannequin, ...patch } }));
  };

  const canvasPointFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * layout.canvasWidth,
      y: ((clientY - rect.top) / rect.height) * layout.canvasHeight,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = canvasPointFromClient(e.clientX, e.clientY);
    let layer: SelectableLayer = selectedLayer;

    if (mannequinBounds) {
      const inMannequin =
        pt.x >= mannequinBounds.x &&
        pt.x <= mannequinBounds.x + mannequinBounds.width &&
        pt.y >= mannequinBounds.y &&
        pt.y <= mannequinBounds.y + mannequinBounds.height;
      if (inMannequin) layer = 'mannequin';
    }

    setSelectedLayer(layer);
    e.currentTarget.setPointerCapture(e.pointerId);

    if (layer === 'mannequin') {
      dragRef.current = {
        layer,
        startX: pt.x,
        startY: pt.y,
        originX: layout.mannequin.x,
        originY: layout.mannequin.y,
        originW: layout.mannequin.width,
        originH: layout.mannequin.height,
      };
      return;
    }

    const textOrigins: Record<Exclude<SelectableLayer, 'mannequin' | 'specs'>, { x: number; y: number }> = {
      frontal: layout.header.frontal,
      slayer: layout.header.slayer,
      subtitle: layout.header.subtitle,
      unit: layout.textPanel.unit,
      footer: layout.textPanel.footer,
    };

    const origin = textOrigins[layer as keyof typeof textOrigins];
    if (!origin) return;
    dragRef.current = {
      layer,
      startX: pt.x,
      startY: pt.y,
      originX: origin.x,
      originY: origin.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const pt = canvasPointFromClient(e.clientX, e.clientY);
    const dx = pt.x - drag.startX;
    const dy = pt.y - drag.startY;

    if (drag.layer === 'mannequin') {
      updateMannequin({
        x: Math.round(drag.originX + dx),
        y: Math.round(drag.originY + dy),
      });
      return;
    }

    if (drag.layer === 'frontal') updateHeader('frontal', { x: drag.originX + dx, y: drag.originY + dy });
    if (drag.layer === 'slayer') updateHeader('slayer', { x: drag.originX + dx, y: drag.originY + dy });
    if (drag.layer === 'subtitle') updateHeader('subtitle', { x: drag.originX + dx, y: drag.originY + dy });
    if (drag.layer === 'unit') {
      setLayout((prev) => ({
        ...prev,
        textPanel: {
          ...prev.textPanel,
          unit: { ...prev.textPanel.unit, x: drag.originX + dx, y: drag.originY + dy },
        },
      }));
      return;
    }
    if (drag.layer === 'footer') {
      setLayout((prev) => ({
        ...prev,
        textPanel: {
          ...prev.textPanel,
          footer: { ...prev.textPanel.footer, x: drag.originX + dx, y: drag.originY + dy },
        },
      }));
    }
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (selectedLayer !== 'mannequin') return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -12 : 12;
    setLayout((prev) => ({
      ...prev,
      mannequin: {
        ...prev.mannequin,
        width: Math.max(120, prev.mannequin.width + delta),
        height: Math.max(120, prev.mannequin.height + delta),
      },
    }));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleCopy = async () => {
    const text = formatBawSlayCardLayoutForCopy(layout);
    await navigator.clipboard.writeText(text);
    setCopyStatus('Layout JSON copied');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const handleReset = () => {
    clearBawSlayCardLayoutDebug();
    setLayout(DEFAULT_BAW_SLAY_CARD_LAYOUT);
    setCopyStatus('Reset to defaults');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await redraw();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'slay-card-debug.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png', 0.92);
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-black" style={{ fontFamily: '"Futura PT Book", Futura, sans-serif' }}>
      <header className="border-b border-black bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: '"Futura PT Medium"' }}>
            Slay Card Layout Debug
          </h1>
          <p className="text-[10px] text-gray-600 uppercase">Drag mannequin or text on preview · edits auto-save to localStorage</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {copyStatus ? <span className="text-[10px] text-green-700">{copyStatus}</span> : null}
          <button type="button" onClick={() => void handleCopy()} className="border border-black px-3 py-1 text-[10px] uppercase bg-white">
            Copy JSON
          </button>
          <button type="button" onClick={handleReset} className="border border-black px-3 py-1 text-[10px] uppercase bg-white">
            Reset defaults
          </button>
          <button type="button" onClick={() => void handleDownload()} className="border border-black px-3 py-1 text-[10px] uppercase bg-white text-[#EB1C24]">
            Download PNG
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
        <aside className="w-full lg:w-[360px] shrink-0 border-r border-gray-300 bg-white overflow-y-auto p-4 space-y-4 max-h-[45vh] lg:max-h-none">
          <section>
            <h2 className="text-[11px] uppercase font-semibold mb-2 text-[#EB1C24]">Sample data</h2>
            <label className="block text-[10px] uppercase mb-1">Unit</label>
            <select
              value={selections.unit}
              onChange={(e) => setSelections((s) => ({ ...s, unit: e.target.value }))}
              className="w-full border border-gray-400 px-2 py-1 text-[11px] mb-2"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <label className="block text-[10px] uppercase mb-1">Hairline (NOIR)</label>
            <select
              value={hairline}
              onChange={(e) => setHairline(e.target.value)}
              className="w-full border border-gray-400 px-2 py-1 text-[11px] mb-2"
            >
              {HAIRLINE_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            {(['length', 'density', 'color', 'styling', 'capSize'] as const).map((field) => (
              <label key={field} className="block text-[10px] uppercase mb-1">
                {field}
                <input
                  type="text"
                  value={selections[field]}
                  onChange={(e) => setSelections((s) => ({ ...s, [field]: e.target.value }))}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[11px] font-mono"
                />
              </label>
            ))}
          </section>

          <section>
            <h2 className="text-[11px] uppercase font-semibold mb-2 text-[#EB1C24]">Selected layer</h2>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value as SelectableLayer)}
              className="w-full border border-gray-400 px-2 py-1 text-[11px] mb-2"
            >
              <option value="mannequin">Mannequin box</option>
              <option value="frontal">FRONTAL</option>
              <option value="slayer">SLAYER</option>
              <option value="subtitle">Subtitle</option>
              <option value="unit">Unit name</option>
              <option value="specs">Specs block</option>
              <option value="footer">Footer</option>
            </select>
            <label className="flex items-center gap-2 text-[10px] uppercase">
              <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
              Show guide outlines
            </label>
          </section>

          {selectedLayer === 'mannequin' ? (
            <section>
              <h2 className="text-[11px] uppercase font-semibold mb-2">Mannequin box</h2>
              <p className="text-[9px] text-gray-500 mb-2">Red = fit box · Blue = drawn mannequin. Drag to move · scroll wheel to resize.</p>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="X" value={layout.mannequin.x} onChange={(x) => updateMannequin({ x })} />
                <NumberField label="Y" value={layout.mannequin.y} onChange={(y) => updateMannequin({ y })} />
                <NumberField label="Width" value={layout.mannequin.width} onChange={(width) => updateMannequin({ width })} />
                <NumberField label="Height" value={layout.mannequin.height} onChange={(height) => updateMannequin({ height })} />
              </div>
            </section>
          ) : null}

          {selectedLayer === 'frontal' ? (
            <section><h2 className="text-[11px] uppercase font-semibold mb-2">FRONTAL</h2><TextStyleFields style={layout.header.frontal} onChange={(p) => updateHeader('frontal', p)} /></section>
          ) : null}
          {selectedLayer === 'slayer' ? (
            <section><h2 className="text-[11px] uppercase font-semibold mb-2">SLAYER</h2><TextStyleFields style={layout.header.slayer} onChange={(p) => updateHeader('slayer', p)} /></section>
          ) : null}
          {selectedLayer === 'subtitle' ? (
            <section><h2 className="text-[11px] uppercase font-semibold mb-2">Subtitle</h2><TextStyleFields style={layout.header.subtitle} onChange={(p) => updateHeader('subtitle', p)} /></section>
          ) : null}
          {selectedLayer === 'unit' ? (
            <section><h2 className="text-[11px] uppercase font-semibold mb-2">Unit name</h2><TextStyleFields style={layout.textPanel.unit} onChange={(p) => updateTextPanel({ unit: { ...layout.textPanel.unit, ...p } })} /></section>
          ) : null}
          {selectedLayer === 'specs' ? (
            <section>
              <h2 className="text-[11px] uppercase font-semibold mb-2">Specs block</h2>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Start Y" value={layout.textPanel.specsStartY} onChange={(specsStartY) => updateTextPanel({ specsStartY })} />
                <NumberField label="Line height" value={layout.textPanel.lineHeight} onChange={(lineHeight) => updateTextPanel({ lineHeight })} />
                <NumberField label="Font size" value={layout.textPanel.specsFontSize} onChange={(specsFontSize) => updateTextPanel({ specsFontSize })} />
                <NumberField label="Font weight" value={Number(layout.textPanel.specsFontWeight)} onChange={(specsFontWeight) => updateTextPanel({ specsFontWeight })} />
              </div>
              <ColorField label="Color" value={layout.textPanel.specsColor} onChange={(specsColor) => updateTextPanel({ specsColor })} />
              <label className="block text-[10px] uppercase mt-2">
                Font family
                <input
                  type="text"
                  value={layout.textPanel.specsFontFamily}
                  onChange={(e) => updateTextPanel({ specsFontFamily: e.target.value })}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[11px] font-mono"
                />
              </label>
            </section>
          ) : null}
          {selectedLayer === 'footer' ? (
            <section><h2 className="text-[11px] uppercase font-semibold mb-2">Footer</h2><TextStyleFields style={layout.textPanel.footer} onChange={(p) => updateTextPanel({ footer: { ...layout.textPanel.footer, ...p } })} /></section>
          ) : null}
        </aside>

        <main ref={previewWrapRef} className="flex-1 flex items-start justify-center p-4 overflow-auto bg-neutral-200">
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            className="border border-black bg-white shadow-lg cursor-move touch-none"
            style={{
              width: layout.canvasWidth * previewScale,
              height: layout.canvasHeight * previewScale,
            }}
          />
        </main>
      </div>
    </div>
  );
}
