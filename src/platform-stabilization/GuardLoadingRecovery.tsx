import { PlatformErrorScreen } from './PlatformErrorScreen';

type Props = {
  guard: string;
  detail: string;
  onRetry?: () => void;
};

/** Terminal recovery when an async guard exceeds its loading budget. */
export function GuardLoadingRecovery({ guard, detail, onRetry }: Props) {
  return (
    <PlatformErrorScreen
      dataAttr="guard-loading-recovery"
      title="Route guard timed out"
      message={`${guard} did not reach a terminal state in time.`}
      boundary={guard}
      extra={detail}
      onRetry={onRetry}
    />
  );
}
