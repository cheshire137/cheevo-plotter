import React from 'react'
import Achievement from '../models/Achievement'
import Game from '../models/Game'
import { Avatar } from '@primer/react'

interface Props {
  achievements: Achievement[];
  game: Game;
  unlockedCount: number;
}

const AchievementsList = ({ game, achievements, unlockedCount }: Props) => {
  if (achievements.length < 1) {
    return <p>{game.name} has no achievements.</p>
  }

  return <div>
    <p>
      Unlocked {unlockedCount} of {achievements.length} &mdash;
      <strong> {Math.round((unlockedCount / achievements.length) * 100)}%</strong>
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
