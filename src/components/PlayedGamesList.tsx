import React from 'react'
import SteamGame from './SteamGame'
import Game from '../models/Game'

interface Props {
  loadGame(game: Game): void;
  games: Game[];
}

const PlayedGamesList = ({ loadGame, games }: Props) => {
  const index = Math.ceil(games.length / 2.0)
  const column1 = games.slice(0, index)
  const column2 = games.slice(index)

  return (
    <section>
      <h2>Played Games ({games.length})</h2>
      <div>
        <ul>
          {column1.map(game => <SteamGame loadGame={loadGame} game={game} key={game.appID} />)}
        </ul>
        <ul>
          {column2.map(game => <SteamGame loadGame={loadGame} game={game} key={game.appID} />)}
        </ul>
      </div>
    </section>
  )
}

export default PlayedGamesList;
