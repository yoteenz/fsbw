import type { SpatialAnnotation } from '../../../../studio-os-core/mission-control';

type Props = {
  annotations: SpatialAnnotation[];
  onSelectNode: (nodeId: string) => void;
  onTravel?: (nodeId: string) => void;
};

export function MissionControlSpatialAnnotations({ annotations, onSelectNode, onTravel }: Props) {
  return (
    <div className="mc-spatial-annotations" aria-label="Holographic spatial annotations">
      {annotations.map((annotation) => (
        <button
          key={annotation.id}
          type="button"
          className={[
            'mc-spatial-annotation',
            `is-${annotation.kind}`,
            annotation.emphasis ? 'is-emphasis' : '',
            annotation.healthClass ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ left: `${annotation.mapX}%`, top: `${annotation.mapY}%` }}
          onClick={() => {
            onSelectNode(annotation.nodeId);
            if (annotation.actionLabel && onTravel) onTravel(annotation.nodeId);
          }}
          title={annotation.title}
        >
          <span className="mc-spatial-annotation__connector" aria-hidden />
          <span className="mc-spatial-annotation__ribbon">
            <span className="mc-spatial-annotation__title">{annotation.title}</span>
            {annotation.lines.map((line) => (
              <span key={line} className="mc-spatial-annotation__line">
                {line}
              </span>
            ))}
            {annotation.actionLabel ? (
              <span className="mc-spatial-annotation__action">{annotation.actionLabel} →</span>
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
