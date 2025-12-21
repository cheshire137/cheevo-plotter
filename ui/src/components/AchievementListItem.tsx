import {Avatar, Button, Details, Stack, useDetails} from '@primer/react'
import {LockIcon, UnlockIcon} from '@primer/octicons-react'
import type {SteamAchievement} from '../types'
import './AchievementListItem.css'

export function AchievementListItem({achievement}: {achievement: SteamAchievement}) {
  const unlockTime = achievement.unlockTime.length > 0 ? new Date(achievement.unlockTime) : undefined
  const {getDetailsProps} = useDetails({})
  const iconUrl =
    achievement.unlocked && achievement.iconUrl.length > 0
      ? achievement.iconUrl
      : !achievement.unlocked && achievement.grayIconUrl.length > 0
      ? achievement.grayIconUrl
      : null
  return (
    <li className="achievement-list-item">
      <Stack direction="horizontal" gap="condensed" align="center">
        <Stack.Item>
          <AchievementIcon iconUrl={iconUrl} />
        </Stack.Item>
        <Stack.Item>
          <Stack direction="horizontal" align="center">
            <Stack.Item>
              {achievement.hidden && !achievement.unlocked ? (
                <Details {...getDetailsProps()} className="hidden-achievement-details">
                  <Button as="summary" variant="link" className="show-hidden-achievement">
                    Show hidden achievement
                  </Button>
                  {achievement.name}
                </Details>
              ) : (
                <span>{achievement.name}</span>
              )}
            </Stack.Item>
            <Stack.Item className="achievement-unlock-info">
              {achievement.unlocked ? (
                <UnlockIcon size={16} className="unlocked-icon" />
              ) : (
                <LockIcon size={16} className="locked-icon" />
              )}
              {unlockTime && <span>{unlockTime.toLocaleDateString()}</span>}
            </Stack.Item>
          </Stack>
          <div>{achievement.description}</div>
        </Stack.Item>
      </Stack>
    </li>
  )
}

function AchievementIcon({iconUrl}: {iconUrl: string | null}) {
  if (!iconUrl) return null
  return <Avatar src={iconUrl} alt="" size={64} />
}
