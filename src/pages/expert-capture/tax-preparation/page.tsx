/**
 * Studio Institute — Tax Preparation Expert Capture
 * Route: /expert-capture/tax-preparation
 */
import { TAX_PREPARATION_PROFILE } from '../../../studio-os-core/expert-capture/profiles';
import { ExpertCaptureInterviewView } from '../ExpertCaptureInterviewView';

export default function TaxPreparationCapturePage() {
  return <ExpertCaptureInterviewView profile={TAX_PREPARATION_PROFILE} />;
}
