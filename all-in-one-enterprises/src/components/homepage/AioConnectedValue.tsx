import { homepageConnectedValue } from '../../data/homepageMobileContent';

export function AioConnectedValue() {
  return (
    <section className="aio-home-section aio-home-connected" aria-labelledby="aio-home-connected-heading">
      <h2 id="aio-home-connected-heading" className="aio-home-connected__title">
        ONE BUSINESS. ONE RECORD.
        <br />
        ONE PLACE TO RUN IT.
      </h2>
      <ul className="aio-home-connected__list">
        {homepageConnectedValue.map((pillar) => (
          <li key={pillar.id} className="aio-home-connected__item">
            <img src={pillar.iconSrc} alt="" className="aio-home-connected__icon" width={36} height={36} />
            <div>
              <h3 className="aio-home-connected__item-title">{pillar.title}</h3>
              <p className="aio-home-connected__item-body">{pillar.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
