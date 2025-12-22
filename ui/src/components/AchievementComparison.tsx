import type {SteamAchievement, SteamUser} from '../types'

const AchievementComparison = ({players, achievement}: {players: SteamUser[]; achievement: SteamAchievement}) => {
  const playersWithAchievement = players.filter(p => p.hasAchievement(achievement.id))

  return (
    <li>
      <img src={achievement.iconUrl} alt={achievement.name} width="64" height="64" />
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
