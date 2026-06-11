import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HairstyleAnalysisPreview from '../components/hairstyle-analysis/HairstyleAnalysisPreview';
import { buildKateenaDemoAnalysis, DEMO_CLIENT_PREVIEW_URL } from '../data/hairstyleAnalysisDemo';
import type { AnalysisTier } from '../types/hairstyleAnalysis';

export default function HairstyleAnalysisDemo() {
  const [tier, setTier] = useState<AnalysisTier>('three_month');
  const [clientPreviewUrl, setClientPreviewUrl] = useState(DEMO_CLIENT_PREVIEW_URL);

  const analysis = useMemo(
    () => buildKateenaDemoAnalysis(tier, clientPreviewUrl),
    [tier, clientPreviewUrl]
  );

  return (
    <div className="min-h-screen bg-white px-4 py-8 pb-24">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link
            to="/home/tools"
            className="text-[10px] uppercase tracking-[0.18em] text-[#808080] hover:text-black"
          >
            ← Tools
          </Link>
          <h1 className="text-lg uppercase tracking-[0.14em] text-black font-medium">
            Hairstyle Analysis
          </h1>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#808080] leading-relaxed">
            Static template + dynamic overlays. AI generates only the client hairstyle preview upstream —
            this page composes the finished card for download.
          </p>
        </header>

        <HairstyleAnalysisPreview
          analysis={analysis}
          onTierChange={setTier}
          clientPreviewUrl={clientPreviewUrl}
          onClientPreviewUrlChange={setClientPreviewUrl}
        />

        <section className="border border-black/15 p-3 text-[9px] uppercase tracking-[0.1em] text-[#808080] leading-relaxed">
          <p className="text-black mb-2">Tier pick counts</p>
          <ul className="space-y-1">
            <li>Free — 1 recommendation (top match)</li>
            <li>3 month — top + 3 additional</li>
            <li>6 month — top + 6 additional</li>
            <li>12 month / black — top + 9 additional</li>
          </ul>
          <p className="mt-3">
            Each tier uses a different field map (free specs + why, 3mo alts, 6mo portfolio, 12mo full grid).
            Upload a client preview, then debug-drag slots to align with the Supabase template placeholders.
          </p>
        </section>
      </div>
    </div>
  );
}
