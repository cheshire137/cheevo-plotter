import {useEffect} from 'react'
import AchievementsList from './AchievementsList'
import AchievementsComparison from './AchievementsComparison'
import PlayersList from './PlayersList'
import SteamGamePageHeader from './SteamGamePageHeader'
import useGetAchievements from '../hooks/use-get-achievements'
import {Flash, PageLayout, Spinner} from '@primer/react'
import type {SteamGame, SteamUser} from '../types'

const SteamGamePage = ({
  steamID,
  steamUsername,
  game,
  loadedPlayer,
  selectedPlayers,
  onUsernameChange,
  onGameChange,
  setPlayerUnlockedAchievements,
}: {
  steamUsername: string
  game: SteamGame
  loadedPlayer: SteamUser
  selectedPlayers: SteamUser[]
  onUsernameChange(newUsername: string): void
  onGameChange(newGame: SteamGame | null): void
  setPlayerUnlockedAchievements(steamID: string, unlockedAchievementKeys: string[]): void
  steamID: string
}) => {
  const {
    data: achievements,
    unlockedAchievements: loadedPlayerUnlockedAchievements,
    error: achievementsError,
    isPending: loadingAchievements,
    iconUri: gameIconUri,
  } = useGetAchievements({steamId: steamID, appId: game.appId})

  useEffect(() => {
    if (!loadingAchievements) {
      const newGameData = Object.assign({}, game) as any
      newGameData.iconUri = gameIconUri
      onGameChange(new Game(newGameData))
    }
  }, [loadingAchievements, onGameChange, gameIconUri, game])

  useEffect(() => {
    if (!loadingAchievements && loadedPlayerUnlockedAchievements) {
      setPlayerUnlockedAchievements(
        loadedPlayer.steamId,
        loadedPlayerUnlockedAchievements.map(a => a.key)
      )
    }
  }, [
    loadingAchievements,
    loadedPlayer.steamId,
    loadedPlayer,
    setPlayerUnlockedAchievements,
    loadedPlayerUnlockedAchievements,
  ])

  if (loadingAchievements) {
    return (
      <div>
        <Spinner size="large" />
        <p>Loading {game.name}'s achievements...</p>
      </div>
    )
  }

  if (achievementsError) {
    return (
      <Flash variant="danger">
        Could not load achievements for {game.name}: {achievementsError}.
      </Flash>
    )
  }

  if (!achievements) {
    return <Flash variant="danger">Could not load achievements for {game.name}.</Flash>
  }

  return (
    <PageLayout>
      <PageLayout.Header>
        <SteamGamePageHeader
          playerSummary={loadedPlayer}
          game={game}
          steamUsername={steamUsername}
          onGameChange={onGameChange}
          totalAchievements={(achievements || []).length}
        />
      </PageLayout.Header>
      <PageLayout.Content>
        {selectedPlayers.length > 0 && (
          <PlayersList
            players={selectedPlayers}
            game={game}
            currentSteamID={steamID}
            onUsernameChange={onUsernameChange}
            onPlayerUnlockedAchievementsLoaded={setPlayerUnlockedAchievements}
          />
        )}
        <AchievementsList achievements={achievements} game={game} loadedPlayer={loadedPlayer} />
        {achievements.length > 0 && selectedPlayers.length > 0 && (
          <AchievementsComparison achievements={achievements} players={selectedPlayers.concat([loadedPlayer])} />
        )}
      </PageLayout.Content>
    </PageLayout>
  )
}

export default SteamGamePage
