import React from 'react'
import Achievement from '../models/Achievement'
import Game from '../models/Game'
import Player from '../models/Player'
import { Avatar } from '@primer/react'

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

  const unlockedCount = loadedPlayer.unlockedAchievements.length
  return <div>
    <p>
      {loadedPlayer.playerSummary.personaname} has unlocked {unlockedCount} of {totalAchievements}
      <span> {totalAchievements === 1 ? 'achievement' : 'achievements'} &mdash;</span>
      <strong> {Math.round((unlockedCount / totalAchievements) * 100)}%</strong>
    </p>
    <ul>
      {achievements.map((achievement) => <li key={achievement.key}>
        <Avatar square src={achievement.iconUri} alt={achievement.name} width="64" height="64" />
        <span>{achievement.name}</span>
      </li>)}
    </ul>
  </div>
}

export default AchievementsList;
