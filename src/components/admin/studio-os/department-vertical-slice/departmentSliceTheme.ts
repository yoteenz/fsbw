/** Department Vertical Slice — immersive room atmosphere */

export const DEPARTMENT_SLICE_STYLES = `
@keyframes dept-ambient-drift {
  0%, 100% { opacity: 0.55; transform: translateY(0); }
  50% { opacity: 0.75; transform: translateY(-6px); }
}
@keyframes dept-orb-pulse {
  0%, 100% { box-shadow: 0 0 24px rgba(201,169,98,0.35), 0 0 48px rgba(201,169,98,0.15); }
  50% { box-shadow: 0 0 36px rgba(201,169,98,0.55), 0 0 64px rgba(201,169,98,0.25); }
}
@keyframes dept-generate-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
.dept-slice-root {
  position: relative;
  min-height: 72vh;
  border-radius: 14px;
  overflow: hidden;
  color: #f5f0e8;
  font-family: "Futura PT", sans-serif;
}
.dept-slice-perspective {
  perspective: 1200px;
  perspective-origin: 50% 42%;
  min-height: 68vh;
  position: relative;
}
.dept-slice-floor {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 8%;
  height: 38%;
  transform: rotateX(62deg);
  transform-origin: center bottom;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.2) 100%);
}
.dept-slice-hero-wall {
  position: absolute;
  left: 14%;
  right: 14%;
  top: 12%;
  height: 42%;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.12);
  background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(20,18,16,0.4) 100%);
  animation: dept-ambient-drift 8s ease-in-out infinite;
}
.dept-slice-zone-btn {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 6px 10px;
  font-size: 7px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(10,10,12,0.55);
  backdrop-filter: blur(8px);
  color: #f5f0e8;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}
.dept-slice-zone-btn:hover,
.dept-slice-zone-btn.is-active {
  border-color: rgba(201,169,98,0.8);
  background: rgba(201,169,98,0.12);
  transform: translate(-50%, -50%) scale(1.04);
}
.dept-slice-orb-center {
  position: absolute;
  left: 50%;
  bottom: 28%;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(201,169,98,0.5);
  background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), rgba(201,169,98,0.25) 40%, rgba(20,18,16,0.8) 100%);
  animation: dept-orb-pulse 4s ease-in-out infinite;
}
.dept-slice-panel {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(12,11,10,0.72);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 12px;
}
.dept-slice-label {
  font-size: 7px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201,169,98,0.9);
  font-family: "Futura PT Medium", sans-serif;
}
.dept-slice-title {
  font-family: "Covered By Your Grace", cursive;
  font-size: 18px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #f5f0e8;
  margin: 4px 0 8px;
}
.dept-slice-generate-btn {
  width: 100%;
  padding: 10px 14px;
  font-size: 8px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid rgba(201,169,98,0.7);
  background: rgba(201,169,98,0.15);
  color: #f5f0e8;
  cursor: pointer;
  font-family: "Futura PT Medium", sans-serif;
}
.dept-slice-generate-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.dept-slice-generate-btn.is-busy {
  animation: dept-generate-pulse 1.2s ease-in-out infinite;
}
.dept-slice-queue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 7px;
  letter-spacing: 0.08em;
}
.dept-slice-mood-card {
  border: 1px solid rgba(255,255,255,0.1);
  padding: 8px;
  margin-top: 6px;
  cursor: grab;
  background: rgba(255,255,255,0.03);
}
.dept-slice-env-preview {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(201,169,98,0.35);
  margin-top: 8px;
  object-fit: cover;
  max-height: 180px;
}
`;
