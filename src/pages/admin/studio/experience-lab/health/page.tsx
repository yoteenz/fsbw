/** Dead-simple health check — no runtime, DNA, or registry imports. */
export default function ExperienceLabHealthPage() {
  return (
    <div
      style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        padding: '24px',
      }}
      data-xelab-health
    >
      Experience Lab Health OK
    </div>
  );
}
