import React from 'react'
import PlayedGameListItem from './PlayedGameListItem'
import Game from '../models/Game'
import { Box, RadioGroup } from '@primer/react'

interface Props {
  loadGame(game: Game): void;
  games: Game[];
}

const PlayedGamesList = ({ loadGame, games }: Props) => <RadioGroup name="game">
  <RadioGroup.Label>Played Games ({games.length})</RadioGroup.Label>
  <Box display="flex" flexWrap="wrap">
    {games.map(game => <PlayedGameListItem loadGame={loadGame} game={game} key={game.appID} />)}
  </Box>
</RadioGroup>

export default PlayedGamesList;
