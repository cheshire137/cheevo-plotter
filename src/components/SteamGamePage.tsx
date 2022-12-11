import React, { useEffect } from 'react'
import Game from '../models/Game'
import Player from '../models/Player'
import Achievement from '../models/Achievement'
import PlayerSummary from '../models/PlayerSummary'
import AchievementsList from './AchievementsList'
import AchievementsComparison from './AchievementsComparison'
import PlayersList from './PlayersList'
import SteamGamePageHeader from './SteamGamePageHeader'
import useGetAchievements from '../hooks/use-get-achievements'
import { Flash, PageLayout, Spinner } from '@primer/react'

interface Props {
  steamUsername: string;
  game: Game;
  loadedPlayer: Player;
  selectedPlayers: Player[];
  onUsernameChange(newUsername: string): void;
  onGameChange(newGame: Game | null): void;
  onPlayerChange(newPlayer: Player): void;
  steamID: string;
}

const SteamGamePage = ({ steamID, steamUsername, game, loadedPlayer, selectedPlayers, onUsernameChange, onGameChange, onPlayerChange }: Props) => {
  const { achievements, unlockedAchievements: loadedPlayerUnlockedAchievements, error: achievementsError, fetching: loadingAchievements, iconUri: gameIconUri } = useGetAchievements(steamID, game.appID)

  useEffect(() => {
    if (!loadingAchievements) {
      const newGameData = Object.assign({}, game) as any
      newGameData.iconUri = gameIconUri
      onGameChange(new Game(newGameData))
    }
  }, [loadingAchievements, onGameChange, gameIconUri, game])

  useEffect(() => {
    if (!loadingAchievements && loadedPlayerUnlockedAchievements) {
      const newLoadedPlayer = new Player(loadedPlayer.steamid, loadedPlayer.playerSummary)
      for (const unlockedAchievement of loadedPlayerUnlockedAchievements) {
        newLoadedPlayer.addUnlockedAchievement(unlockedAchievement)
      }
      onPlayerChange(newLoadedPlayer)
    }
  }, [loadingAchievements, onPlayerChange, loadedPlayer.playerSummary, loadedPlayer.steamid, loadedPlayerUnlockedAchievements])

  const onPlayerUnlockedAchievementsLoaded = (player: Player, unlockedAchievements: Achievement[]) => {
    const newPlayer = new Player(player.steamid, player.playerSummary)
    for (const achievement of unlockedAchievements) {
      newPlayer.addUnlockedAchievement(achievement)
    }
    onPlayerChange(newPlayer)
  }

  if (loadingAchievements) {
    return <div>
      <Spinner size='large' />
      <p>Loading {game.name}'s achievements...</p>
    </div>
  }

  if (achievementsError) {
    return <Flash variant='danger'>Could not load achievements for {game.name}: {achievementsError}.</Flash>
  }

  if (!achievements) {
    return <Flash variant='danger'>Could not load achievements for {game.name}.</Flash>
  }

  return <PageLayout>
    <PageLayout.Header>
      <SteamGamePageHeader playerSummary={loadedPlayer.playerSummary} game={game} steamUsername={steamUsername}
        onGameChange={onGameChange} totalAchievements={(achievements || []).length} />
    </PageLayout.Header>
    <PageLayout.Content>
      {selectedPlayers.length > 0 && <PlayersList
        players={selectedPlayers}
        game={game}
        currentSteamID={steamID}
        onUsernameChange={onUsernameChange}
        onPlayerUnlockedAchievementsLoaded={onPlayerUnlockedAchievementsLoaded}
      />}
      <AchievementsList achievements={achievements} game={game} loadedPlayer={loadedPlayer} />
      {achievements.length > 0 && selectedPlayers.length > 0 && <AchievementsComparison
        achievements={achievements}
        players={selectedPlayers.concat([loadedPlayer])}
      />}
    </PageLayout.Content>
  </PageLayout>
}

export default SteamGamePage;
