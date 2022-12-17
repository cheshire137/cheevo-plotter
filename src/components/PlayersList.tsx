import React from 'react'
import PlayerListItem from './PlayerListItem'
import Player from '../models/Player'
import Game from '../models/Game'
import Achievement from '../models/Achievement'
import PlayerSummary from '../models/PlayerSummary'

interface Props {
  players: Player[];
  currentSteamID: string;
  game: Game;
  onUsernameChange(username: string, steamID?: string): void;
  onPlayerUnlockedAchievementsLoaded(steamID: string, unlockedAchievementKeys: string[]): void;
}

const PlayersList = ({ players, game, onPlayerUnlockedAchievementsLoaded, currentSteamID, onUsernameChange }: Props) => <div>
  <span>Comparing:</span>
  <ul>
    {players.map(player => <PlayerListItem
      game={game}
      onUsernameChange={onUsernameChange}
      key={player.steamid}
      steamID={player.steamid}
      playerSummary={player.playerSummary}
      onUnlockedAchievementsLoaded={unlockedAchievements =>
        onPlayerUnlockedAchievementsLoaded(player.steamid, unlockedAchievements.map(a => a.key))}
      isCurrent={currentSteamID === player.steamid} />)}
  </ul>
</div>

export default PlayersList;
