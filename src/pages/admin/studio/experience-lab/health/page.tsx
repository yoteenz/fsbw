import { useRequireStudioWorldAdmin } from '../../../../../hooks/useRequireStudioWorldAdmin';

/** Dead-simple health check — admin infrastructure only. */
export default function ExperienceLabHealthPage() {
  useRequireStudioWorldAdmin();
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
