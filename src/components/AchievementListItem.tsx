import React from 'react'
import Achievement from '../models/Achievement'
import Game from '../models/Game'
import Player from '../models/Player'
import { Avatar } from '@primer/react'

interface Props {
  achievement: Achievement;
}

const AchievementListItem = ({ achievement }: Props) => {
  return <li>
    <Avatar square src={achievement.iconUri} alt={achievement.name} width="64" height="64" />
    <span>{achievement.name}</span>
  </li>
}

export default AchievementListItem
