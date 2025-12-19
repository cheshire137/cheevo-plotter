import {FormControl, Radio} from '@primer/react'
import type {SteamGame} from '../types'

interface Props {
  game: SteamGame
  loadGame(game: SteamGame): void
}

const PlayedGameListItem = ({game, loadGame}: Props) => {
  const domId = 'game-' + game.appId

  return (
    <FormControl id={domId} sx={{my: 1, mr: 3, display: 'flex', alignItems: 'center'}}>
      <Radio value={game.appId} onChange={() => loadGame(game)} />
      <FormControl.Label>{game.name}</FormControl.Label>
    </FormControl>
  )
}

export default PlayedGameListItem
