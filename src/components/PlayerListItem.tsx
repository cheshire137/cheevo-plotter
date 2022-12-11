import React, { useEffect } from 'react'
import Achievement from '../models/Achievement'
import Game from '../models/Game'
import useGetAchievements from '../hooks/use-get-achievements'
import { Flash, Spinner } from '@primer/react'

interface Props {
  player: any;
  isCurrent: boolean;
  game: Game;
  onUsernameChange(username: string, steamID?: string): void;
  onGameIconUriChange(uri: string | null): void;
  onAchievementsLoaded(achievements: Achievement[]): void;
}

const PlayerListItem = ({ player, isCurrent, game, onAchievementsLoaded, onUsernameChange, onGameIconUriChange }: Props) => {
  const { achievements, error: achievementsError, fetching: loadingAchievements, iconUri: gameIconUri } = useGetAchievements(player.steamid, game.appID)

  useEffect(() => {
    if (!loadingAchievements) {
      onGameIconUriChange(gameIconUri || null)
    }
  }, [onGameIconUriChange, gameIconUri, loadingAchievements])

  useEffect(() => {
    if (!loadingAchievements && achievements) {
      onAchievementsLoaded(achievements)
    }
  }, [loadingAchievements, achievements, onAchievementsLoaded])

  const getUnlockPercentageText = () => {
    if (typeof achievements !== 'object') {
      return '--';
    }
    var unlockCount = 0;
    const total = achievements.length;
    for (var i = 0; i < total; i++) {
      if (achievements[i].isUnlocked) {
        unlockCount++;
      }
    }
    return Math.round((unlockCount / total) * 100) + '%';
  }

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

  return <li>
    {isCurrent ? <span>
      <img src={player.avatar} alt={player.steamid} />
      <span>{player.personaname}</span>
    </span> :
      <button type="button" onClick={e => onUsernameChange(player.personaname, player.steamid)}>
        <img src={player.avatar} alt={player.steamid} />
        <span>{player.personaname}</span>
      </button>
    }
    <span>{getUnlockPercentageText()}</span>
  </li>
}

export default PlayerListItem;
