import Game from '../models/Game'
import { FormControl, Radio } from '@primer/react'

interface Props {
  game: Game;
  loadGame(game: Game): void;
}

const PlayedGameListItem = ({ game, loadGame }: Props) => {
  const domId = 'game-' + game.appID

  return <FormControl id={domId} sx={{ my: 1, mr: 3, display: 'flex', alignItems: 'center' }}>
    <Radio value={game.appID.toString()} onChange={() => loadGame(game)} />
    <FormControl.Label>{game.name}</FormControl.Label>
  </FormControl>
}

export default PlayedGameListItem
