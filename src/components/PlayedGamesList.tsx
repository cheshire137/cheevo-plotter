import React from 'react';
import SteamGame from './SteamGame';

interface Props {
  loadSteamApp(appID: number): void;
  games: number[];
}

const PlayedGamesList = ({ loadSteamApp, games }: Props) => {
  const index = Math.ceil(games.length / 2.0)
  const column1 = games.slice(0, index)
  const column2 = games.slice(index)

  return (
    <section>
      <h2>Played Games ({games.length})</h2>
      <div>
        <ul>
          {column1.map(appId => <SteamGame loadSteamApp={loadSteamApp} appID={appId} key={appId} />)}
        </ul>
        <ul>
          {column2.map(appId => <SteamGame loadSteamApp={loadSteamApp} appID={appId} key={appId} />)}
        </ul>
      </div>
    </section>
  )
}

export default PlayedGamesList;
