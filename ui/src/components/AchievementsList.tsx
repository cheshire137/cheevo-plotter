import Achievement from '../models/Achievement'
import AchievementListItem from './AchievementListItem'
import type {SteamGame, SteamUser} from '../types'

const AchievementsList = ({
  game,
  achievements,
  loadedPlayer,
}: {
  achievements: Achievement[]
  game: SteamGame
  loadedPlayer: SteamUser
}) => {
  const totalAchievements = achievements.length

  if (totalAchievements < 1) {
    return <p>{game.name} has no achievements.</p>
  }

  const unlockedCount = loadedPlayer.totalUnlockedAchievements()
  return (
    <div>
      <p>
        {loadedPlayer.name} has unlocked {unlockedCount} of {totalAchievements}
        <span> {totalAchievements === 1 ? 'achievement' : 'achievements'} &mdash;</span>
        <strong> {Math.round((unlockedCount / totalAchievements) * 100)}%</strong>
      </p>
      <ul>
        {achievements.map(achievement => (
          <AchievementListItem key={achievement.key} achievement={achievement} />
        ))}
      </ul>
    </div>
  )
}

export default AchievementsList
