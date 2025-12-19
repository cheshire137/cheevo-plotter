import Achievement from '../models/Achievement'
import {Avatar} from '@primer/react'

function AchievementListItem({achievement}: {achievement: Achievement}) {
  return (
    <li className="achievement-list-item">
      <Avatar className="achievement-icon" square src={achievement.iconUri} alt={achievement.name} size={64} />
      <span>{achievement.name}</span>
    </li>
  )
}

export default AchievementListItem
