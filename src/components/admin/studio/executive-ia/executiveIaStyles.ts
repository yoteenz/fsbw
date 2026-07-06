/** M83 microinteraction keyframes — communicate work, not decoration. */
export const EXECUTIVE_IA_STYLES = `
@keyframes eiaWingEnter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes eiaPipelineFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes eiaPulseRing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}
@keyframes eiaGraphDraw {
  from { stroke-dashoffset: 120; }
  to { stroke-dashoffset: 0; }
}
.executive-ia-wing-enter {
  animation: eiaWingEnter 0.35s ease-out;
}
.executive-ia-pipeline-active {
  background: linear-gradient(90deg, rgba(235,28,36,0.15) 0%, rgba(235,28,36,0.35) 50%, rgba(235,28,36,0.15) 100%);
  background-size: 200% 100%;
  animation: eiaPipelineFlow 2.5s linear infinite;
}
.executive-ia-health-ring {
  animation: eiaPulseRing 3s ease-in-out infinite;
}
.executive-ia-sparkline-path {
  stroke-dasharray: 120;
  animation: eiaGraphDraw 1.2s ease-out forwards;
}
`;
