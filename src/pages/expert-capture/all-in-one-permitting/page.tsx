/**
 * Studio Institute — All In One Permitting Expert Capture
 * Route: /expert-capture/all-in-one-permitting
 */
import { ALL_IN_ONE_PERMITTING_PROFILE } from '../../../studio-os-core/expert-capture/profiles';
import { ExpertCaptureInterviewView } from '../ExpertCaptureInterviewView';

export default function AllInOnePermittingCapturePage() {
  return <ExpertCaptureInterviewView profile={ALL_IN_ONE_PERMITTING_PROFILE} />;
}
