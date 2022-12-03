import React from 'react'
import PlayerListItem from './PlayerListItem'
import Player from '../models/Player'
import Achievement from '../models/Achievement'

interface Props {
  achievements: { [key: string]: Achievement[] };
  players: Player[];
  currentSteamID: string;
  onUsernameChange(username: string, steamID?: string): void;
}

const PlayersList = ({ achievements, players, currentSteamID, onUsernameChange }: Props) => <div>
  <span>Comparing:</span>
  <ul>
    {players.map(player => <PlayerListItem onUsernameChange={onUsernameChange} key={player.steamid} player={player}
      isCurrent={currentSteamID === player.steamid} achievements={achievements[player.steamid]} />)}
  </ul>
</div>

export default PlayersList;
