/**
 * Expert Trust Framework™ — Welcome & Protection Cards
 */
import { PROTECTION_CARDS } from '../../../studio-os-core/expert-capture/trust-vault';
import { vaultGlass, VaultBtn, VaultStylesInjector } from './vault-glass-styles';

export function ExpertTrustWelcome({
  onContinue,
  instituteLabel,
}: {
  onContinue: () => void;
  instituteLabel: string;
}) {
  return (
    <div style={vaultGlass.page}>
      <VaultStylesInjector />
      <div style={vaultGlass.container}>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {instituteLabel} · Expert Trust Framework™
        </p>
        <h1 style={vaultGlass.h1}>Protecting Your Expertise</h1>
        <p style={vaultGlass.sub}>
          Before we begin documenting your workflow, here&apos;s exactly how Studio protects your knowledge — like opening a
          bank vault, not filling out a questionnaire.
        </p>

        <div style={vaultGlass.grid}>
          {PROTECTION_CARDS.map((card, i) => (
            <div key={card.id} style={vaultGlass.glassCard(i * 40)}>
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 600 }}>{card.title}</h3>
              <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.5, color: '#334155' }}>{card.summary}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.45 }}>{card.detail}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <VaultBtn primary onClick={onContinue}>
            Continue to Agreements
          </VaultBtn>
        </div>
      </div>
    </div>
  );
}
