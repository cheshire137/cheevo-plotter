import React, { useEffect } from 'react'
import Achievement from '../models/Achievement'
import Game from '../models/Game'
import useGetAchievements from '../hooks/use-get-achievements'
import { Avatar, Button, Flash, Spinner } from '@primer/react'

interface Props {
  player: any;
  isCurrent: boolean;
  game: Game;
  onUsernameChange(username: string, steamID?: string): void;
  onUnlockedAchievementsLoaded(achievements: Achievement[]): void;
}

const PlayerListItem = ({ player, isCurrent, game, onUnlockedAchievementsLoaded, onUsernameChange }: Props) => {
  const { achievements, unlockedAchievements, error: achievementsError, fetching: loadingAchievements } = useGetAchievements(player, game.appID)

  useEffect(() => {
    if (!loadingAchievements && unlockedAchievements) {
      onUnlockedAchievementsLoaded(unlockedAchievements)
    }
  }, [loadingAchievements, unlockedAchievements, onUnlockedAchievementsLoaded])

  if (loadingAchievements) {
    return <div>
      <Spinner />
      <p>Loading {player.personaname}'s achievements for {game.name}...</p>
    </div>
  }

  if (achievementsError) {
    if (achievementsError.match(/app has no stats/i)) {
      return <p>{player.personaname} hasn't played {game.name}.</p>
    }
    return <Flash variant="danger">
      Failed to load {player.personaname}'s achievements for {game.name}: {achievementsError}.
    </Flash>
  }

  if (!achievements || !unlockedAchievements) {
    return <Flash variant="danger">Couldn't load achievements for {game.name}.</Flash>
  }

  return <li>
    {isCurrent ? <>
      <Avatar src={player.avatar} alt={player.steamid} />
      <span>{player.personaname}</span>
    </> : <Button type="button" onClick={e => onUsernameChange(player.personaname, player.steamid)}>
      <Avatar src={player.avatar} alt={player.steamid} /> {player.personaname}
    </Button>}
    <span>{Math.round((unlockedAchievements.length / achievements.length) * 100) + '%'}</span>
  </li>
}

export default PlayerListItem;
