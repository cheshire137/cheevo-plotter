import Player from '../models/Player'
import Achievement from '../models/Achievement'

interface Props {
  players: Player[];
  achievement: Achievement;
}

const AchievementComparison = ({ players, achievement }: Props) => {
  const playersWithAchievement = players.filter(p => p.hasAchievement(achievement.key))

  return <li>
    <img src={achievement.iconUri} alt={achievement.name} width="64" height="64" />
    <div>
      <h2>{achievement.name}</h2>
      <ul>
        {playersWithAchievement.map(player => <li key={player.steamid}>{player.playerSummary.personaname}</li>)}
      </ul>
    </div>
  </li>
}

export default AchievementComparison;
