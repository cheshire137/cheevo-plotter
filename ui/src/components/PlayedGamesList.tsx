import PlayedGameListItem from './PlayedGameListItem'
import Game from '../models/Game'
import {RadioGroup} from '@primer/react'
import './PlayedGamesList.css'

interface Props {
  loadGame(game: Game): void
  games: Game[]
}

const PlayedGamesList = ({loadGame, games}: Props) => (
  <RadioGroup name="game">
    <RadioGroup.Label>Played Games ({games.length})</RadioGroup.Label>
    <div className="played-games-list">
      {games.map(game => (
        <PlayedGameListItem loadGame={loadGame} game={game} key={game.appID} />
      ))}
    </div>
  </RadioGroup>
)

export default PlayedGamesList
