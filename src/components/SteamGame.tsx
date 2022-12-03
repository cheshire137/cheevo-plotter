import React from 'react'
import Game from '../models/Game'

interface Props {
  game: Game;
  loadGame(game: Game): void;
}

const SteamGame = ({ game, loadGame }: Props) => <li>
  <button type="button" onClick={() => loadGame(game)}>{game.name}</button>
</li>

export default SteamGame;
