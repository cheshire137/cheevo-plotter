import React from 'react'
import Achievement from '../models/Achievement'
import { Avatar, Box } from '@primer/react'

interface Props {
  achievement: Achievement;
}

const AchievementListItem = ({ achievement }: Props) => {
  return <Box as="li" sx={{ mb: 2 }}>
    <Avatar sx={{ mr: 2 }} square src={achievement.iconUri} alt={achievement.name} size={64} />
    <span>{achievement.name}</span>
  </Box>
}

export default AchievementListItem
