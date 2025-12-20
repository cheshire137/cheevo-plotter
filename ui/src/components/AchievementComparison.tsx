import Achievement from '../models/Achievement'
import type {SteamUser} from '../types'

const AchievementComparison = ({players, achievement}: {players: SteamUser[]; achievement: Achievement}) => {
  const playersWithAchievement = players.filter(p => p.hasAchievement(achievement.key))

  return (
    <li>
      <img src={achievement.iconUri} alt={achievement.name} width="64" height="64" />
      <div>
        <h2>{achievement.name}</h2>
        <ul>
          {playersWithAchievement.map(player => (
            <li key={player.steamId}>{player.name}</li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export default AchievementComparison
