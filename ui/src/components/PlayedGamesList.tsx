import PlayedGameListItem from './PlayedGameListItem'
import {RadioGroup} from '@primer/react'
import type {SteamGame} from '../types'
import './PlayedGamesList.css'

interface Props {
  loadGame(game: SteamGame): void
  games: SteamGame[]
}

const PlayedGamesList = ({loadGame, games}: Props) => (
  <RadioGroup name="game">
    <RadioGroup.Label>Played Games ({games.length})</RadioGroup.Label>
    <div className="played-games-list">
      {games.map(game => (
        <PlayedGameListItem loadGame={loadGame} game={game} key={game.appId} />
      ))}
    </div>
  </RadioGroup>
)

export default PlayedGamesList
