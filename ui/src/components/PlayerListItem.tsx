import React, { useEffect } from 'react'
import Achievement from '../models/Achievement'
import Game from '../models/Game'
import PlayerSummary from '../models/PlayerSummary'
import useGetAchievements from '../hooks/use-get-achievements'
import { Avatar, Button, Flash, Spinner } from '@primer/react'

interface Props {
  steamID: string;
  playerSummary: PlayerSummary;
  isCurrent: boolean;
  game: Game;
  onUsernameChange(username: string, steamID?: string): void;
  onUnlockedAchievementsLoaded(achievements: Achievement[]): void;
}

const PlayerListItem = ({ playerSummary, steamID, isCurrent, game, onUnlockedAchievementsLoaded, onUsernameChange }: Props) => {
  const { achievements, unlockedAchievements, error: achievementsError, fetching: loadingAchievements } = useGetAchievements(steamID, game.appID)

  useEffect(() => {
    if (!loadingAchievements && unlockedAchievements) {
      onUnlockedAchievementsLoaded(unlockedAchievements)
    }
  }, [loadingAchievements, unlockedAchievements, onUnlockedAchievementsLoaded])

  if (loadingAchievements) {
    return <div>
      <Spinner />
      <p>Loading {playerSummary.personaname}'s achievements for {game.name}...</p>
    </div>
  }

  if (achievementsError) {
    if (achievementsError.match(/app has no stats/i)) {
      return <p>{playerSummary.personaname} hasn't played {game.name}.</p>
    }
    return <Flash variant="danger">
      Failed to load {playerSummary.personaname}'s achievements for {game.name}: {achievementsError}.
    </Flash>
  }

  if (!achievements || !unlockedAchievements) {
    return <Flash variant="danger">Couldn't load achievements for {game.name}.</Flash>
  }

  const avatarAndPlayerName = <>
    <Avatar src={playerSummary.avatarmedium} alt={playerSummary.personaname} /> {playerSummary.personaname}
  </>

  return <li>
    {isCurrent ? avatarAndPlayerName : <Button
      type="button"
      onClick={e => onUsernameChange(playerSummary.personaname, steamID)}
    >{avatarAndPlayerName}</Button>}
    <span>{Math.round((unlockedAchievements.length / achievements.length) * 100) + '%'}</span>
  </li>
}

export default PlayerListItem;
