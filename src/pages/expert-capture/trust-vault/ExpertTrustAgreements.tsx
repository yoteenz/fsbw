/**
 * Expert Trust Framework™ — Agreements (legal placeholders)
 */
import { useState } from 'react';
import { TRUST_AGREEMENTS } from '../../../studio-os-core/expert-capture/trust-vault';
import type { TrustAgreementId } from '../../../studio-os-core/expert-capture/trust-vault';
import { vaultGlass, VaultBtn, VaultStylesInjector } from './vault-glass-styles';

export function ExpertTrustAgreements({
  expertName,
  onSign,
}: {
  expertName: string;
  onSign: (signatureName: string, accepted: Record<TrustAgreementId, boolean>) => void;
}) {
  const [accepted, setAccepted] = useState<Partial<Record<TrustAgreementId, boolean>>>({});
  const [signature, setSignature] = useState(expertName);
  const [expanded, setExpanded] = useState<TrustAgreementId | null>(TRUST_AGREEMENTS[0]?.id ?? null);

  const allRequired = TRUST_AGREEMENTS.filter((a) => a.required).every((a) => accepted[a.id]);
  const canSign = allRequired && signature.trim().length >= 2;

  return (
    <div style={vaultGlass.page}>
      <VaultStylesInjector />
      <div style={vaultGlass.container}>
        <h1 style={vaultGlass.h1}>Institutional Agreements</h1>
        <p style={vaultGlass.sub}>
          Review each agreement. Placeholder legal text will be replaced with attorney-reviewed language. Signature required
          before recording begins.
        </p>

        {TRUST_AGREEMENTS.map((agreement, i) => (
          <div key={agreement.id} style={vaultGlass.glassCard(i * 30)}>
            <button
              type="button"
              onClick={() => setExpanded(expanded === agreement.id ? null : agreement.id)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
              }}
            >
              <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600 }}>{agreement.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>{agreement.subtitle}</p>
            </button>
            {expanded === agreement.id ? (
              <div style={vaultGlass.agreementScroll}>{agreement.placeholderText}</div>
            ) : null}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, marginTop: 8 }}>
              <input
                type="checkbox"
                checked={Boolean(accepted[agreement.id])}
                onChange={(e) => setAccepted((prev) => ({ ...prev, [agreement.id]: e.target.checked }))}
              />
              I have read and accept this agreement{agreement.required ? ' (required)' : ''}
            </label>
          </div>
        ))}

        <div style={vaultGlass.glassCard(200)}>
          <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 8 }}>Electronic signature</label>
          <input
            style={vaultGlass.input}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Type your full name"
          />
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px' }}>
            By signing, you acknowledge all checked agreements. Date: {new Date().toLocaleDateString()}
          </p>
          <VaultBtn
            primary
            disabled={!canSign}
            onClick={() =>
              onSign(
                signature.trim(),
                accepted as Record<TrustAgreementId, boolean>
              )
            }
          >
            Sign & Open Knowledge Vault™
          </VaultBtn>
        </div>
      </div>
    </div>
  );
}
