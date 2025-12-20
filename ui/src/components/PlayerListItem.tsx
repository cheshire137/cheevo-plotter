import {useEffect} from 'react'
import Achievement from '../models/Achievement'
import useGetAchievements from '../hooks/use-get-achievements'
import {Avatar, Button, Flash, Spinner} from '@primer/react'
import type {SteamGame, SteamUser} from '../types'

interface Props {
  steamID: string
  playerSummary: SteamUser
  isCurrent: boolean
  game: SteamGame
  onUsernameChange(username: string, steamID?: string): void
  onUnlockedAchievementsLoaded(achievements: Achievement[]): void
}

const PlayerListItem = ({
  playerSummary,
  steamID,
  isCurrent,
  game,
  onUnlockedAchievementsLoaded,
  onUsernameChange,
}: Props) => {
  const {
    achievements,
    unlockedAchievements,
    error: achievementsError,
    fetching: loadingAchievements,
  } = useGetAchievements(steamID, game.appId)

  useEffect(() => {
    if (!loadingAchievements && unlockedAchievements) {
      onUnlockedAchievementsLoaded(unlockedAchievements)
    }
  }, [loadingAchievements, unlockedAchievements, onUnlockedAchievementsLoaded])

  if (loadingAchievements) {
    return (
      <div>
        <Spinner />
        <p>
          Loading {playerSummary.name}'s achievements for {game.name}...
        </p>
      </div>
    )
  }

  if (achievementsError) {
    if (achievementsError.match(/app has no stats/i)) {
      return (
        <p>
          {playerSummary.name} hasn't played {game.name}.
        </p>
      )
    }
    return (
      <Flash variant="danger">
        Failed to load {playerSummary.name}'s achievements for {game.name}: {achievementsError}.
      </Flash>
    )
  }

  if (!achievements || !unlockedAchievements) {
    return <Flash variant="danger">Couldn't load achievements for {game.name}.</Flash>
  }

  const avatarAndPlayerName = (
    <>
      <Avatar src={playerSummary.avatarUrl} alt={playerSummary.name} /> {playerSummary.name}
    </>
  )

  return (
    <li>
      {isCurrent ? (
        avatarAndPlayerName
      ) : (
        <Button type="button" onClick={e => onUsernameChange(playerSummary.name, steamID)}>
          {avatarAndPlayerName}
        </Button>
      )}
      <span>{Math.round((unlockedAchievements.length / achievements.length) * 100) + '%'}</span>
    </li>
  )
}

export default PlayerListItem
