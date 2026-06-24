import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GRAND_LOBBY_DIRECTORY_FLOORS,
  GRAND_LOBBY_ECONOMY_EARN,
  GRAND_LOBBY_ECONOMY_PROGRESS,
  GRAND_LOBBY_HOUSE_INFO_LINKS,
  GRAND_LOBBY_MEMBERSHIP_BENEFITS,
  GRAND_LOBBY_WELCOME_COPY,
  isGrandLobbyDebugEnabled,
} from '../../constants/desktopGrandLobby';
import {
  DESKTOP_GRAND_LOBBY_DEBUG_PANELS,
  desktopGrandLobbyRectToImageRect,
  getDesktopGrandLobbyRect,
} from '../../constants/desktopGrandLobbyLayout';
import { buildDesktopDestinationHref } from '../../constants/desktopNavQuickRoutes';
import { useDesktopTowerTravelOptional } from '../desktop-tower/DesktopTowerNavProvider';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { DESKTOP_GRAND_LOBBY_IMAGE } from '../../constants/desktopGrandLobby';
import { DESKTOP_GRAND_LOBBY_LAYOUT_SEED } from '../../constants/desktopGrandLobbyLayout';
import { GrandLobbyPanelAnchor } from './GrandLobbyPanelAnchor';
import './GrandLobby.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

function useGrandLobbyNavigate() {
  const navigate = useNavigate();
  const towerTravel = useDesktopTowerTravelOptional();

  return (href: string) => {
    if (towerTravel) towerTravel.quickTravelTo(href);
    else navigate(href);
  };
}

function CrownMark() {
  return (
    <span className="gl-panel__crown" aria-hidden>
      <svg viewBox="0 0 16 12" fill="currentColor">
        <path d="M1 9.5h14v1.5H1V9.5zm1.2-6.8L4 5.2l3.2-4.1L8 5.2l3.2-4.1L12.8 2.7 11 9.5H5L3.2 2.7z" />
      </svg>
    </span>
  );
}

export function GrandLobbyPanels({ measureRef }: Props) {
  const go = useGrandLobbyNavigate();
  const debug = isGrandLobbyDebugEnabled();

  return (
    <div className="gl-layer" aria-label="Grand Lobby orientation panels">
      <GrandLobbyPanelAnchor measureRef={measureRef} regionId="membershipAccess">
        <article className="gl-panel gl-panel--info gl-panel--baked">
          <header className="gl-panel__header">
            <CrownMark />
            <h2 className="gl-panel__title">Membership &amp; Access</h2>
          </header>
          <p className="gl-panel__lede">
            Unlock more of the mansion through membership. Benefits may include:
          </p>
          <ul className="gl-panel__list">
            {GRAND_LOBBY_MEMBERSHIP_BENEFITS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="gl-panel__footer">
            Some experiences are available to all guests. Others require elevated access.
          </p>
        </article>
      </GrandLobbyPanelAnchor>

      <GrandLobbyPanelAnchor measureRef={measureRef} regionId="mansionEconomy">
        <article className="gl-panel gl-panel--info gl-panel--baked">
          <header className="gl-panel__header">
            <CrownMark />
            <h2 className="gl-panel__title">The Mansion Economy</h2>
          </header>
          <p className="gl-panel__eyebrow">Earn • Collect • Unlock</p>
          <p className="gl-panel__lede">Participate throughout the mansion to earn rewards.</p>
          <div className="gl-panel__sections">
            <section>
              <h3 className="gl-panel__section-title">Earn:</h3>
              <ul className="gl-panel__list">
                {GRAND_LOBBY_ECONOMY_EARN.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="gl-panel__section-title">Ways to progress:</h3>
              <ul className="gl-panel__list">
                {GRAND_LOBBY_ECONOMY_PROGRESS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </GrandLobbyPanelAnchor>

      <GrandLobbyPanelAnchor measureRef={measureRef} regionId="mansionDirectory" zIndex={9}>
        <nav className="gl-panel gl-panel--directory gl-panel--baked" aria-label="Mansion directory">
          <header className="gl-panel__header gl-panel__header--center">
            <CrownMark />
            <h2 className="gl-panel__title">Mansion Directory</h2>
          </header>
          <div className="gl-directory">
            {GRAND_LOBBY_DIRECTORY_FLOORS.map((floor) => (
              <section key={floor.level} className="gl-directory__floor">
                <div className="gl-directory__floor-head">
                  <span className="gl-directory__level">{floor.level}</span>
                  <h3 className="gl-directory__floor-name">{floor.name}</h3>
                </div>
                <ul className="gl-directory__rooms">
                  {floor.rooms.map((room) => {
                    const href = buildDesktopDestinationHref(room.floorPath, room.destinationId);
                    return (
                      <li key={room.label}>
                        <button
                          type="button"
                          className="gl-directory__room"
                          onClick={() => go(href)}
                        >
                          {room.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>
      </GrandLobbyPanelAnchor>

      <GrandLobbyPanelAnchor measureRef={measureRef} regionId="welcomeMansion">
        <article className="gl-panel gl-panel--welcome gl-panel--baked">
          <header className="gl-panel__header">
            <CrownMark />
            <h2 className="gl-panel__title">Welcome to the Mansion</h2>
          </header>
          <p className="gl-panel__headline">{GRAND_LOBBY_WELCOME_COPY.headline}</p>
          <p className="gl-panel__body">{GRAND_LOBBY_WELCOME_COPY.body}</p>
          <p className="gl-panel__stats">{GRAND_LOBBY_WELCOME_COPY.footer}</p>
        </article>
      </GrandLobbyPanelAnchor>

      <GrandLobbyPanelAnchor measureRef={measureRef} regionId="houseInformation">
        <nav className="gl-panel gl-panel--links gl-panel--baked" aria-label="House information">
          <header className="gl-panel__header">
            <CrownMark />
            <h2 className="gl-panel__title">House Information</h2>
          </header>
          <ul className="gl-links">
            {GRAND_LOBBY_HOUSE_INFO_LINKS.map((link) => (
              <li key={link.label}>
                <button type="button" className="gl-links__item" onClick={() => go(link.href)}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </GrandLobbyPanelAnchor>

      {debug
        ? DESKTOP_GRAND_LOBBY_DEBUG_PANELS.map((panel) => {
            const rect = getDesktopGrandLobbyRect(DESKTOP_GRAND_LOBBY_LAYOUT_SEED, panel.id);
            return (
              <DesktopRoomCoverRectAnchor
                key={panel.id}
                measureRef={measureRef}
                image={DESKTOP_GRAND_LOBBY_IMAGE}
                imageRect={desktopGrandLobbyRectToImageRect(rect)}
                zIndex={20}
                style={{
                  pointerEvents: 'none',
                  border: `2px dashed ${panel.color}`,
                  background: `${panel.color}22`,
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 4,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: panel.color,
                    textTransform: 'uppercase',
                  }}
                >
                  {panel.label}
                </span>
              </DesktopRoomCoverRectAnchor>
            );
          })
        : null}
    </div>
  );
}
