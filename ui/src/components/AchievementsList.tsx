import Achievement from '../models/Achievement'
import Game from '../models/Game'
import Player from '../models/Player'
import { Avatar } from '@primer/react'
import AchievementListItem from './AchievementListItem'

interface Props {
  achievements: Achievement[];
  game: Game;
  loadedPlayer: Player;
}

const AchievementsList = ({ game, achievements, loadedPlayer }: Props) => {
  const totalAchievements = achievements.length

  if (totalAchievements < 1) {
    return <p>{game.name} has no achievements.</p>
  }

  const unlockedCount = loadedPlayer.totalUnlockedAchievements()
  return <div>
    <p>
      {loadedPlayer.playerSummary.personaname} has unlocked {unlockedCount} of {totalAchievements}
      <span> {totalAchievements === 1 ? 'achievement' : 'achievements'} &mdash;</span>
      <strong> {Math.round((unlockedCount / totalAchievements) * 100)}%</strong>
    </p>
    <ul>
      {achievements.map(achievement => <AchievementListItem key={achievement.key} achievement={achievement} />)}
    </ul>
  </div>
}

export default AchievementsList;
