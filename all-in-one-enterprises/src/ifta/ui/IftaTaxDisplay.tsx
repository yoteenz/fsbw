import { taxPositionLabel } from '../iftaDerive';
import type { IftaQuarterCase } from '../iftaTypes';

/** Founder D-TAX-FIGURES — no engine; staff summary only. */
export function IftaTaxDisplay({ quarter }: { quarter: IftaQuarterCase }) {
  if (!quarter.returnSummary) {
    return <p className="ifta-tax-pending">Tax due / credit — pending AIO preparation</p>;
  }
  const pos = taxPositionLabel(quarter.returnSummary.netPosition);
  return (
    <p>
      <strong>{pos.label}:</strong> {pos.amount}
    </p>
  );
}
