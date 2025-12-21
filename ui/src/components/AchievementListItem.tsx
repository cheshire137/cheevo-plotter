import {Avatar, Button, Details, useDetails} from '@primer/react'
import {LockIcon, UnlockIcon} from '@primer/octicons-react'
import type {SteamAchievement} from '../types'
import './AchievementListItem.css'

export function AchievementListItem({achievement}: {achievement: SteamAchievement}) {
  const unlockTime = achievement.unlockTime.length > 0 ? new Date(achievement.unlockTime) : undefined
  const {getDetailsProps} = useDetails({})
  return (
    <li className="achievement-list-item">
      {achievement.unlocked && achievement.iconUrl.length > 0 && (
        <Avatar className="achievement-icon" src={achievement.iconUrl} alt="" size={64} />
      )}
      {!achievement.unlocked && achievement.grayIconUrl.length > 0 && (
        <Avatar className="achievement-icon" src={achievement.grayIconUrl} alt="" size={64} />
      )}
      {achievement.hidden ? (
        <Details {...getDetailsProps()} className="hidden-achievement-details">
          <Button as="summary" variant="link" className="show-hidden-achievement">Show hidden achievement</Button>
          {achievement.name}
        </Details>
      ) : <span>{achievement.name}</span>}
      {achievement.unlocked ? <UnlockIcon /> : <LockIcon />}
      {unlockTime && <span>{unlockTime.toLocaleDateString()}</span>}
    </li>
  )
}
