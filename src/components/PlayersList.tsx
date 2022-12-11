import React from 'react'
import PlayerListItem from './PlayerListItem'
import Player from '../models/Player'
import Game from '../models/Game'
import Achievement from '../models/Achievement'

interface Props {
  players: Player[];
  currentSteamID: string;
  game: Game;
  onUsernameChange(username: string, steamID?: string): void;
  onGameIconUriChange(uri: string | null): void;
  onAchievementsLoaded(achievements: Achievement[]): void;
  onPlayerUnlockedAchievementsLoaded(player: Player, unlockedAchievements: Achievement[]): void;
}

const PlayersList = ({ players, game, onAchievementsLoaded, onPlayerUnlockedAchievementsLoaded, currentSteamID, onGameIconUriChange, onUsernameChange }: Props) => <div>
  <span>Comparing:</span>
  <ul>
    {players.map(player => <PlayerListItem
      game={game}
      onUsernameChange={onUsernameChange}
      key={player.steamid}
      player={player}
      onGameIconUriChange={onGameIconUriChange}
      onAchievementsLoaded={onAchievementsLoaded}
      onUnlockedAchievementsLoaded={unlockedAchievements =>
        onPlayerUnlockedAchievementsLoaded(player, unlockedAchievements)}
      isCurrent={currentSteamID === player.steamid} />)}
  </ul>
</div>

export default PlayersList;
