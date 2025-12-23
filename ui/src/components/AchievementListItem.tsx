import {Avatar, Button, Details, Stack, useDetails} from '@primer/react'
import {LockIcon, UnlockIcon} from '@primer/octicons-react'
import type {SteamGameAchievement, SteamPlayerAchievement} from '../types'
import './AchievementListItem.css'

export function AchievementListItem({
  gameAchievement,
  playerAchievement,
}: {
  gameAchievement: SteamGameAchievement
  playerAchievement?: SteamPlayerAchievement | null
}) {
  const unlockTime = playerAchievement && playerAchievement.unlockTime.length > 0 ? new Date(playerAchievement.unlockTime) : undefined
  const {getDetailsProps} = useDetails({})
  const iconUrl =
    playerAchievement?.unlocked && gameAchievement.iconUrl.length > 0
      ? gameAchievement.iconUrl
      : (!playerAchievement || !playerAchievement.unlocked) && gameAchievement.grayIconUrl.length > 0
      ? gameAchievement.grayIconUrl
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
              {gameAchievement.hidden && (!playerAchievement || !playerAchievement.unlocked) ? (
                <Details {...getDetailsProps()} className="hidden-achievement-details">
                  <Button as="summary" variant="link" className="show-hidden-achievement">
                    Show hidden achievement
                  </Button>
                  <strong>{gameAchievement.name}</strong>
                </Details>
              ) : (
                <strong>{gameAchievement.name}</strong>
              )}
            </Stack.Item>
            <Stack.Item className="achievement-unlock-info">
              {playerAchievement?.unlocked ? (
                <UnlockIcon size={16} className="unlocked-icon" />
              ) : (
                <LockIcon size={16} className="locked-icon" />
              )}
              {unlockTime && <span>{unlockTime.toLocaleDateString()}</span>}
            </Stack.Item>
          </Stack>
          <div>{gameAchievement.description}</div>
        </Stack.Item>
      </Stack>
    </li>
  )
}

function AchievementIcon({iconUrl}: {iconUrl: string | null}) {
  if (!iconUrl) return null
  return <Avatar src={iconUrl} alt="" size={64} />
}
