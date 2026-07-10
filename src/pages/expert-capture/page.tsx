/**
 * Studio Institute — Expert Capture Interview MVP v1
 * Route: /expert-capture
 */
import { DEFAULT_EXPERT_CAPTURE_PROFILE } from '../../studio-os-core/expert-capture/profiles';
import { ExpertCaptureInterviewView } from './ExpertCaptureInterviewView';

export default function ExpertCapturePage() {
  return <ExpertCaptureInterviewView profile={DEFAULT_EXPERT_CAPTURE_PROFILE} />;
}
