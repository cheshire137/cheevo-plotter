import React from 'react';
import Player from './Player';

interface Props {
  achievements: any[];
  players: any[];
  currentSteamID: string;
}

const PlayersList = ({ achievements, players, currentSteamID }: Props) => <div>
  <span>Comparing:</span>
  <ul>
    {players.map((player) => <Player key={player.steamid} player={player}
      isCurrent={currentSteamID === player.steamid} achievements={achievements[player.steamid]} />)}
  </ul>
</div>

export default PlayersList;