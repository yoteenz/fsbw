import type { CSSProperties } from 'react';
import type {
  CreativePreviewCompanyId,
  PreviewArchitectureArchetype,
} from '../../../../studio-os-core/creative-studio-preview';

type Props = {
  companyId: CreativePreviewCompanyId;
  archetype: PreviewArchitectureArchetype;
  conceptId: 'a' | 'b' | 'c';
  /** When true, scene renders with zero chrome — blind industry recognition test. */
  blindMode?: boolean;
};

/**
 * Cinematic environmental preview — a believable PLACE, not a UI mockup.
 * No logos, company names, labels, or text inside the scene.
 * Identity is communicated through architecture, materials, lighting, and circulation.
 */
export function CreativePreviewEnvironment({
  companyId,
  archetype,
  conceptId,
  blindMode = false,
}: Props) {
  return (
    <div
      data-creative-preview-environment
      data-company={blindMode ? 'hidden' : companyId}
      data-archetype={archetype}
      data-concept={conceptId}
      data-blind={blindMode ? 'true' : 'false'}
      style={viewportShell}
      aria-label={blindMode ? 'Environmental preview — identify the industry' : undefined}
    >
      {archetype === 'institutional-crystal' ? (
        <StudioOsScene variant={conceptId} />
      ) : null}
      {archetype === 'luxury-flagship' ? (
        <FrontalSlayerScene variant={conceptId} />
      ) : null}
      {archetype === 'broadcast-command' ? (
        <NdxScene variant={conceptId} />
      ) : null}
    </div>
  );
}

/* ─── Shared primitives ─────────────────────────────────────────────── */

function SceneAtmosphere({ gradient }: { gradient: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: gradient,
        pointerEvents: 'none',
      }}
    />
  );
}

function LightShaft({ left, width, opacity }: { left: string; width: string; opacity: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: 0,
        left,
        width,
        height: '100%',
        background: `linear-gradient(180deg, rgba(255,255,255,${opacity}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ─── Studio OS — executive headquarters / knowledge institution ─────── */

function StudioOsScene({ variant }: { variant: 'a' | 'b' | 'c' }) {
  if (variant === 'b') return <StudioOsBridge variant="b" />;
  if (variant === 'c') return <StudioOsObservatory variant="c" />;
  return <StudioOsAtrium variant="a" />;
}

function StudioOsAtrium({ variant }: { variant: 'a' }) {
  return (
    <div style={{ ...sceneBase, background: '#e8e4df' }} data-scene="studio-os-atrium">
      <SceneAtmosphere gradient="linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(200,210,220,0.15) 45%, rgba(160,170,180,0.25) 100%)" />
      <LightShaft left="35%" width="30%" opacity={0.35} />
      {/* Glass vault ceiling */}
      <div style={vaultCeiling} />
      {/* Mezzanine observation ring */}
      <div style={mezzanineRing} />
      {/* Grand atrium floor — marble */}
      <div style={marbleFloor} />
      {/* Crystal registry center */}
      <div style={crystalPedestal}>
        <div style={crystalCore} />
        <div style={crystalFacet1} />
        <div style={crystalFacet2} />
      </div>
      {/* Left wing — knowledge archive */}
      <div style={{ ...wingVolume, left: '4%', width: '22%', height: '55%' }}>
        <div style={archiveShelfRow} />
        <div style={{ ...archiveShelfRow, top: '35%' }} />
        <div style={{ ...archiveShelfRow, top: '55%' }} />
      </div>
      {/* Right wing — command bridge access */}
      <div style={{ ...wingVolume, right: '4%', width: '22%', height: '55%' }}>
        <div style={bridgeRamp} />
      </div>
      {/* Executive bridge spanning center */}
      <div style={executiveBridge} />
      {/* Constitutional archive alcoves */}
      <div style={{ ...archiveAlcove, left: '28%', bottom: '18%' }} />
      <div style={{ ...archiveAlcove, right: '28%', bottom: '18%' }} />
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

function StudioOsBridge({ variant }: { variant: 'b' }) {
  return (
    <div style={{ ...sceneBase, background: '#dfe2e6' }} data-scene="studio-os-bridge">
      <SceneAtmosphere gradient="linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(180,190,200,0.2) 100%)" />
      <LightShaft left="50%" width="20%" opacity={0.28} />
      <div style={{ ...vaultCeiling, height: '28%' }} />
      <div style={{ ...marbleFloor, background: 'linear-gradient(180deg, #f0eeea 0%, #d8d4ce 100%)' }} />
      {/* Compact atrium — glass spine */}
      <div style={glassSpine} />
      {/* Prominent executive bridge */}
      <div style={{ ...executiveBridge, top: '38%', height: '8%', boxShadow: '0 8px 32px rgba(100,120,140,0.35)' }} />
      <div style={{ ...wingVolume, left: '6%', width: '18%', height: '45%', top: '30%' }} />
      <div style={{ ...wingVolume, right: '6%', width: '18%', height: '45%', top: '30%' }} />
      <div style={{ ...crystalPedestal, transform: 'translateX(-50%) scale(0.7)', bottom: '22%' }} />
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

function StudioOsObservatory({ variant }: { variant: 'c' }) {
  return (
    <div style={{ ...sceneBase, background: '#1a2030' }} data-scene="studio-os-observatory">
      <SceneAtmosphere gradient="radial-gradient(ellipse at 50% 30%, rgba(120,160,200,0.35) 0%, transparent 60%)" />
      {/* Observatory dome */}
      <div style={observatoryDome} />
      {/* Floating archive rings */}
      <div style={{ ...archiveRing, top: '32%', width: '70%', height: '12%' }} />
      <div style={{ ...archiveRing, top: '48%', width: '55%', height: '10%', opacity: 0.7 }} />
      {/* Crystal lens array */}
      <div style={lensArray}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ ...lensElement, left: `${15 + i * 17}%`, opacity: 0.5 + i * 0.1 }} />
        ))}
      </div>
      {/* Spiral circulation implied by curved ramp */}
      <div style={spiralRamp} />
      <div style={{ ...marbleFloor, background: 'linear-gradient(180deg, #2a3040 0%, #1a2030 100%)', opacity: 0.9 }} />
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

/* ─── Frontal Slayer — luxury beauty flagship ────────────────────────── */

function FrontalSlayerScene({ variant }: { variant: 'a' | 'b' | 'c' }) {
  if (variant === 'b') return <FrontalSlayerGallery variant="b" />;
  if (variant === 'c') return <FrontalSlayerDiagnostic variant="c" />;
  return <FrontalSlayerConcierge variant="a" />;
}

function FrontalSlayerConcierge({ variant }: { variant: 'a' }) {
  return (
    <div style={{ ...sceneBase, background: '#f5f2ee' }} data-scene="frontal-slayer-concierge">
      <SceneAtmosphere gradient="linear-gradient(180deg, rgba(255,252,248,0.8) 0%, rgba(240,235,228,0.4) 60%, rgba(220,215,205,0.3) 100%)" />
      <LightShaft left="60%" width="25%" opacity={0.25} />
      {/* Polished marble floor */}
      <div style={{ ...marbleFloor, background: 'linear-gradient(180deg, #faf8f5 0%, #ebe6df 100%)' }} />
      {/* Concierge threshold — low reception plinth */}
      <div style={conciergePlinth} />
      {/* Mirror diagnostics wall */}
      <div style={mirrorWall}>
        <div style={mirrorReflection} />
        <div style={mirrorGlow} />
      </div>
      {/* Editorial salon seating arc */}
      <div style={salonArc}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ ...salonPod, left: `${18 + i * 22}%` }} />
        ))}
      </div>
      {/* Floating acrylic display volumes */}
      <div style={{ ...acrylicVolume, left: '12%', top: '42%', width: '14%', height: '22%' }} />
      <div style={{ ...acrylicVolume, right: '15%', top: '38%', width: '12%', height: '18%' }} />
      {/* Couture showroom depth */}
      <div style={showroomDepth} />
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

function FrontalSlayerGallery({ variant }: { variant: 'b' }) {
  return (
    <div style={{ ...sceneBase, background: '#f8f6f3' }} data-scene="frontal-slayer-gallery">
      <SceneAtmosphere gradient="linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(230,225,218,0.3) 100%)" />
      <div style={{ ...marbleFloor, background: 'linear-gradient(180deg, #fcfaf7 0%, #e8e2da 100%)' }} />
      {/* Gallery spotlights */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ ...spotlightPool, left: `${12 + i * 22}%` }} />
      ))}
      {/* Pedestal gallery circuit */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ ...pedestal, left: `${10 + i * 21}%` }} />
      ))}
      {/* Consultation pods at perimeter */}
      <div style={{ ...consultationPod, left: '4%', bottom: '22%' }} />
      <div style={{ ...consultationPod, right: '4%', bottom: '22%' }} />
      <div style={{ ...showroomDepth, opacity: 0.5, height: '35%' }} />
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

function FrontalSlayerDiagnostic({ variant }: { variant: 'c' }) {
  return (
    <div style={{ ...sceneBase, background: '#f0ece8' }} data-scene="frontal-slayer-diagnostic">
      <SceneAtmosphere gradient="linear-gradient(135deg, rgba(255,250,245,0.7) 0%, rgba(200,210,225,0.15) 100%)" />
      {/* Clinical glamour — mirror wall luminance */}
      <div style={{ ...mirrorWall, width: '55%', height: '65%', left: '50%', transform: 'translateX(-50%)', top: '8%' }}>
        <div style={{ ...mirrorGlow, boxShadow: '0 0 80px rgba(255,255,255,0.6)' }} />
      </div>
      {/* Floating acrylic consultation island */}
      <div style={consultationIsland} />
      {/* Diagnostic corridor perspective */}
      <div style={diagnosticCorridor} />
      <div style={{ ...marbleFloor, background: 'linear-gradient(180deg, #f5f2ee 0%, #ddd8d0 100%)' }} />
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

/* ─── NDX — modern media headquarters ────────────────────────────────── */

function NdxScene({ variant }: { variant: 'a' | 'b' | 'c' }) {
  if (variant === 'b') return <NdxCommandDeck variant="b" />;
  if (variant === 'c') return <NdxSignalLab variant="c" />;
  return <NdxNewsroom variant="a" />;
}

function NdxNewsroom({ variant }: { variant: 'a' }) {
  return (
    <div style={{ ...sceneBase, background: '#0f1419' }} data-scene="ndx-newsroom">
      <SceneAtmosphere gradient="linear-gradient(180deg, rgba(30,40,55,0.9) 0%, rgba(15,20,25,1) 100%)" />
      {/* Overhead track lights */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ ...trackLight, left: `${8 + i * 18}%` }} />
      ))}
      {/* Signal wall — center */}
      <div style={signalWall}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ ...signalPanel, top: `${8 + (i % 3) * 28}%`, left: `${4 + Math.floor(i / 3) * 48}%` }} />
        ))}
      </div>
      {/* Producer stations */}
      <div style={{ ...producerStation, left: '6%', bottom: '18%' }} />
      <div style={{ ...producerStation, left: '22%', bottom: '18%' }} />
      <div style={{ ...producerStation, right: '22%', bottom: '18%' }} />
      <div style={{ ...producerStation, right: '6%', bottom: '18%' }} />
      {/* Editorial floor sweep */}
      <div style={editorialFloor} />
      {/* Media archive spine — rear */}
      <div style={archiveSpine} />
      {/* Dynamic display ticker strip */}
      <div style={tickerStrip}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} style={{ ...tickerSegment, left: `${i * 12.5}%` }} />
        ))}
      </div>
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

function NdxCommandDeck({ variant }: { variant: 'b' }) {
  return (
    <div style={{ ...sceneBase, background: '#121820' }} data-scene="ndx-command">
      <SceneAtmosphere gradient="linear-gradient(180deg, rgba(25,35,50,0.95) 0%, rgba(10,14,20,1) 100%)" />
      {/* Elevated command deck */}
      <div style={commandDeck}>
        <div style={commandConsole} />
      </div>
      {/* Floor below — producer stations tighter */}
      <div style={{ ...signalWall, width: '50%', height: '35%', top: 'auto', bottom: '28%', transform: 'translateX(-50%)' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ ...signalPanel, width: '30%', height: '40%', top: `${10 + i * 30}%`, left: `${5 + i * 32}%` }} />
        ))}
      </div>
      <div style={{ ...producerStation, left: '8%', bottom: '12%', width: '18%' }} />
      <div style={{ ...producerStation, right: '8%', bottom: '12%', width: '18%' }} />
      <div style={editorialFloor} />
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

function NdxSignalLab({ variant }: { variant: 'c' }) {
  return (
    <div style={{ ...sceneBase, background: '#0a0e14' }} data-scene="ndx-signal-lab">
      <SceneAtmosphere gradient="radial-gradient(ellipse at 50% 50%, rgba(40,80,120,0.25) 0%, transparent 70%)" />
      {/* Experimental signal arrays — circular energy loop */}
      <div style={signalRingOuter} />
      <div style={signalRingInner} />
      {/* Kinetic light trails */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            ...kineticTrail,
            transform: `rotate(${i * 60}deg)`,
            transformOrigin: '50% 55%',
          }}
        />
      ))}
      {/* Pulsing display wall */}
      <div style={{ ...signalWall, width: '80%', height: '40%', top: '15%' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              ...signalPanel,
              width: '11%',
              height: '70%',
              top: '15%',
              left: `${2 + i * 12}%`,
              opacity: 0.6 + (i % 3) * 0.15,
            }}
          />
        ))}
      </div>
      {/* Archive visible through glass spine */}
      <div style={glassArchiveSpine} />
      <div style={editorialFloor} />
      <span data-variant={variant} style={srOnly} />
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */

const viewportShell: CSSProperties = {
  borderRadius: 12,
  overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  minHeight: 320,
  position: 'relative',
};

const sceneBase: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 320,
  overflow: 'hidden',
};

const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
};

/* Studio OS */
const vaultCeiling: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '10%',
  width: '80%',
  height: '35%',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(200,210,225,0.3) 60%, transparent 100%)',
  borderRadius: '0 0 50% 50%',
  boxShadow: 'inset 0 -20px 40px rgba(255,255,255,0.2)',
};

const mezzanineRing: CSSProperties = {
  position: 'absolute',
  top: '28%',
  left: '8%',
  width: '84%',
  height: '6%',
  background: 'linear-gradient(90deg, transparent, rgba(180,190,200,0.5) 20%, rgba(180,190,200,0.5) 80%, transparent)',
  borderRadius: 4,
};

const marbleFloor: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '35%',
  background: 'linear-gradient(180deg, #f2f0ec 0%, #d4cfc8 100%)',
};

const crystalPedestal: CSSProperties = {
  position: 'absolute',
  bottom: '28%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '18%',
  height: '28%',
};

const crystalCore: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '60%',
  height: '80%',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(180,200,220,0.6) 50%, rgba(140,160,180,0.4) 100%)',
  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  filter: 'drop-shadow(0 0 20px rgba(200,220,255,0.5))',
};

const crystalFacet1: CSSProperties = {
  position: 'absolute',
  bottom: '10%',
  left: '15%',
  width: '25%',
  height: '50%',
  background: 'rgba(255,255,255,0.4)',
  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  transform: 'rotate(-15deg)',
};

const crystalFacet2: CSSProperties = {
  position: 'absolute',
  bottom: '10%',
  right: '15%',
  width: '25%',
  height: '50%',
  background: 'rgba(255,255,255,0.35)',
  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  transform: 'rotate(15deg)',
};

const wingVolume: CSSProperties = {
  position: 'absolute',
  bottom: '20%',
  background: 'linear-gradient(180deg, rgba(220,225,230,0.8) 0%, rgba(180,190,200,0.6) 100%)',
  borderRadius: '4px 4px 0 0',
  boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.3)',
};

const archiveShelfRow: CSSProperties = {
  position: 'absolute',
  top: '15%',
  left: '10%',
  width: '80%',
  height: '8%',
  background: 'rgba(160,170,180,0.4)',
  borderRadius: 2,
};

const bridgeRamp: CSSProperties = {
  position: 'absolute',
  bottom: '20%',
  left: '20%',
  width: '60%',
  height: '15%',
  background: 'linear-gradient(180deg, rgba(200,210,220,0.5) 0%, rgba(160,170,180,0.3) 100%)',
  transform: 'perspective(200px) rotateX(25deg)',
};

const executiveBridge: CSSProperties = {
  position: 'absolute',
  top: '42%',
  left: '15%',
  width: '70%',
  height: '5%',
  background: 'linear-gradient(90deg, rgba(200,210,225,0.6), rgba(230,235,240,0.8), rgba(200,210,225,0.6))',
  borderRadius: 2,
  boxShadow: '0 4px 16px rgba(100,120,140,0.2)',
};

const archiveAlcove: CSSProperties = {
  position: 'absolute',
  width: '12%',
  height: '18%',
  background: 'rgba(170,180,190,0.35)',
  borderRadius: '4px 4px 0 0',
};

const glassSpine: CSSProperties = {
  position: 'absolute',
  top: '15%',
  left: '48%',
  width: '4%',
  height: '55%',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(200,210,220,0.3) 100%)',
  borderRadius: 2,
};

const observatoryDome: CSSProperties = {
  position: 'absolute',
  top: '-5%',
  left: '20%',
  width: '60%',
  height: '45%',
  background: 'radial-gradient(ellipse at 50% 100%, rgba(80,100,130,0.6) 0%, rgba(40,50,70,0.3) 70%, transparent 100%)',
  borderRadius: '50% 50% 0 0',
};

const archiveRing: CSSProperties = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  border: '2px solid rgba(120,140,170,0.4)',
  borderRadius: '50%',
  background: 'transparent',
};

const lensArray: CSSProperties = {
  position: 'absolute',
  top: '22%',
  left: 0,
  width: '100%',
  height: '20%',
};

const lensElement: CSSProperties = {
  position: 'absolute',
  width: '12%',
  height: '100%',
  background: 'linear-gradient(180deg, rgba(180,210,240,0.5) 0%, rgba(100,130,160,0.2) 100%)',
  borderRadius: '50%',
  filter: 'blur(1px)',
};

const spiralRamp: CSSProperties = {
  position: 'absolute',
  bottom: '15%',
  left: '30%',
  width: '40%',
  height: '40%',
  border: '3px solid rgba(140,160,190,0.3)',
  borderRadius: '50%',
  borderTopColor: 'transparent',
  borderRightColor: 'transparent',
  transform: 'rotate(-30deg)',
};

/* Frontal Slayer */
const conciergePlinth: CSSProperties = {
  position: 'absolute',
  bottom: '32%',
  left: '8%',
  width: '22%',
  height: '12%',
  background: 'linear-gradient(180deg, #faf8f5 0%, #e8e4de 100%)',
  borderRadius: '4px 4px 0 0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
};

const mirrorWall: CSSProperties = {
  position: 'absolute',
  top: '12%',
  right: '8%',
  width: '38%',
  height: '55%',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(230,225,215,0.7) 40%, rgba(210,205,195,0.5) 100%)',
  borderRadius: 4,
  boxShadow: 'inset 0 0 60px rgba(255,255,255,0.5), 0 8px 24px rgba(0,0,0,0.08)',
};

const mirrorReflection: CSSProperties = {
  position: 'absolute',
  top: '20%',
  left: '15%',
  width: '70%',
  height: '50%',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
  borderRadius: 2,
};

const mirrorGlow: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(ellipse at 60% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)',
  borderRadius: 4,
};

const salonArc: CSSProperties = {
  position: 'absolute',
  bottom: '28%',
  left: '5%',
  width: '90%',
  height: '15%',
};

const salonPod: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  width: '16%',
  height: '100%',
  background: 'linear-gradient(180deg, rgba(245,240,235,0.9) 0%, rgba(225,218,210,0.7) 100%)',
  borderRadius: '8px 8px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const acrylicVolume: CSSProperties = {
  position: 'absolute',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(240,235,230,0.15) 100%)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: 4,
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
};

const showroomDepth: CSSProperties = {
  position: 'absolute',
  bottom: '35%',
  left: '35%',
  width: '30%',
  height: '25%',
  background: 'linear-gradient(180deg, rgba(250,248,245,0.6) 0%, rgba(235,230,222,0.4) 100%)',
  transform: 'perspective(300px) rotateX(8deg)',
  borderRadius: 4,
};

const spotlightPool: CSSProperties = {
  position: 'absolute',
  top: '25%',
  width: '18%',
  height: '35%',
  background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.5) 0%, transparent 70%)',
};

const pedestal: CSSProperties = {
  position: 'absolute',
  bottom: '30%',
  width: '8%',
  height: '22%',
  background: 'linear-gradient(180deg, #faf8f5 0%, #e0dbd4 100%)',
  borderRadius: '2px 2px 0 0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

const consultationPod: CSSProperties = {
  position: 'absolute',
  width: '14%',
  height: '20%',
  background: 'rgba(245,240,235,0.85)',
  borderRadius: '50% 50% 0 0',
  boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.5)',
};

const consultationIsland: CSSProperties = {
  position: 'absolute',
  bottom: '25%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '28%',
  height: '18%',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(230,225,218,0.2) 100%)',
  border: '1px solid rgba(255,255,255,0.6)',
  borderRadius: '50%',
  boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
};

const diagnosticCorridor: CSSProperties = {
  position: 'absolute',
  bottom: '20%',
  left: '20%',
  width: '60%',
  height: '8%',
  background: 'linear-gradient(90deg, rgba(230,225,218,0.5), rgba(245,240,235,0.8), rgba(230,225,218,0.5))',
  transform: 'perspective(400px) rotateX(40deg)',
};

/* NDX */
const trackLight: CSSProperties = {
  position: 'absolute',
  top: '3%',
  width: '8%',
  height: '4%',
  background: 'rgba(255,255,255,0.15)',
  borderRadius: 2,
  boxShadow: '0 4px 20px rgba(255,255,255,0.1)',
};

const signalWall: CSSProperties = {
  position: 'absolute',
  top: '18%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '55%',
  height: '42%',
  background: 'rgba(20,28,38,0.95)',
  border: '1px solid rgba(60,80,100,0.5)',
  borderRadius: 4,
  boxShadow: '0 0 40px rgba(40,100,160,0.15)',
};

const signalPanel: CSSProperties = {
  position: 'absolute',
  width: '44%',
  height: '26%',
  background: 'linear-gradient(135deg, rgba(40,80,120,0.7) 0%, rgba(20,50,80,0.5) 100%)',
  borderRadius: 2,
  boxShadow: 'inset 0 0 12px rgba(80,140,200,0.3)',
};

const producerStation: CSSProperties = {
  position: 'absolute',
  bottom: '18%',
  width: '14%',
  height: '22%',
  background: 'linear-gradient(180deg, rgba(30,40,52,0.95) 0%, rgba(18,24,32,0.98) 100%)',
  borderRadius: '4px 4px 0 0',
  border: '1px solid rgba(50,70,90,0.4)',
  boxShadow: '0 -4px 16px rgba(0,0,0,0.3)',
};

const editorialFloor: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '22%',
  background: 'linear-gradient(180deg, rgba(25,32,42,0.9) 0%, rgba(12,16,22,1) 100%)',
};

const archiveSpine: CSSProperties = {
  position: 'absolute',
  top: '25%',
  right: '3%',
  width: '8%',
  height: '50%',
  background: 'linear-gradient(180deg, rgba(35,45,58,0.8) 0%, rgba(20,28,38,0.9) 100%)',
  borderRadius: 2,
};

const tickerStrip: CSSProperties = {
  position: 'absolute',
  bottom: '22%',
  left: 0,
  width: '100%',
  height: '4%',
  background: 'rgba(15,25,35,0.9)',
  overflow: 'hidden',
};

const tickerSegment: CSSProperties = {
  position: 'absolute',
  top: '15%',
  width: '10%',
  height: '70%',
  background: 'rgba(60,100,140,0.5)',
  borderRadius: 1,
};

const commandDeck: CSSProperties = {
  position: 'absolute',
  top: '12%',
  left: '10%',
  width: '80%',
  height: '22%',
  background: 'linear-gradient(180deg, rgba(35,48,62,0.95) 0%, rgba(22,30,40,0.98) 100%)',
  borderRadius: '4px 4px 0 0',
  border: '1px solid rgba(60,80,100,0.4)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const commandConsole: CSSProperties = {
  position: 'absolute',
  bottom: '20%',
  left: '15%',
  width: '70%',
  height: '40%',
  background: 'rgba(20,35,50,0.8)',
  borderRadius: 2,
  boxShadow: 'inset 0 0 20px rgba(40,100,160,0.2)',
};

const signalRingOuter: CSSProperties = {
  position: 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '75%',
  height: '45%',
  border: '2px solid rgba(60,120,180,0.3)',
  borderRadius: '50%',
};

const signalRingInner: CSSProperties = {
  position: 'absolute',
  top: '42%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '45%',
  height: '28%',
  border: '1px solid rgba(80,140,200,0.4)',
  borderRadius: '50%',
};

const kineticTrail: CSSProperties = {
  position: 'absolute',
  top: '35%',
  left: '50%',
  width: '2px',
  height: '25%',
  background: 'linear-gradient(180deg, rgba(80,160,220,0.6) 0%, transparent 100%)',
  transformOrigin: '50% 0',
};

const glassArchiveSpine: CSSProperties = {
  position: 'absolute',
  top: '20%',
  right: '5%',
  width: '6%',
  height: '55%',
  background: 'linear-gradient(180deg, rgba(40,60,80,0.4) 0%, rgba(25,35,48,0.6) 100%)',
  border: '1px solid rgba(80,120,160,0.3)',
  borderRadius: 2,
};
