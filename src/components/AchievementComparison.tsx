import React from 'react'
import Player from '../models/Player'

interface Props {
  players: { [key: string]: Player };
  achievement: any;
}

const AchievementComparison = ({ players, achievement }: Props) => {
  const playerIds: string[] = Object.keys(achievement.players);

  return <li>
    {typeof achievement.iconUri === 'string' ? <img src={achievement.iconUri} alt={achievement.name}
      width="64" height="64" /> : null}
    <div>
      <h2>{achievement.name}</h2>
      <ul>
        {playerIds.map(playerId => <li key={playerId}>{players[playerId].personaname}</li>)}
      </ul>
    </div>
  </li>
}

export default AchievementComparison;
