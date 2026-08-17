import { AIOButton } from '../AIOButton';
import { aioPaths } from '../../utils/paths';

type Props = {
  title?: string;
  description?: string;
  className?: string;
};

export function AioRoadmapFooterCta({
  title = 'Not sure what you need?',
  description = 'Get a custom business roadmap tailored to your operation.',
  className = '',
}: Props) {
  return (
    <section className={`aio-ps-roadmap-footer${className ? ` ${className}` : ''}`}>
      <div className="aio-container aio-ps-roadmap-footer__inner">
        <div className="aio-ps-roadmap-footer__copy">
          <h2 className="aio-ps-roadmap-footer__title">{title}</h2>
          <p className="aio-ps-roadmap-footer__desc">{description}</p>
        </div>
        <AIOButton to={aioPaths.roadReadyPublic} variant="gold" showArrow>
          Get My Roadmap
        </AIOButton>
      </div>
    </section>
  );
}
