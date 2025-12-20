import {useState, useEffect} from 'react'
import PlayedGamesList from './PlayedGamesList'
import FriendsList from './FriendsList'
import SteamUserPageHeader from './SteamUserPageHeader'
import useGetPlayerSummaries from '../hooks/use-get-player-summaries'
import useGetGames from '../hooks/use-get-games'
import {PageLayout, Flash, Spinner} from '@primer/react'
import type {SteamGame, SteamUser} from '../types'
import {useGetCurrentUser} from '../hooks/use-get-current-user'

function SteamUserPage({
  steamUsername,
  onUsernameChange,
  onPlayerSummaryChange,
  onPlayerSelectionChange,
  loadGame,
}: {
  steamUsername: string
  onUsernameChange(newUsername: string): void
  onPlayerSummaryChange(newPlayerSummary: SteamUser): void
  onPlayerSelectionChange(selectedPlayers: SteamUser[]): void
  loadGame(game: SteamGame): void
}) {
  const {data: currentUser} = useGetCurrentUser()
  const {data: games, error: gamesError, isPending: loadingGames} = useGetGames({steamId: currentUser?.steamId})
  const [selectedFriendSteamIDs, setSelectedFriendSteamIDs] = useState<string[]>([])
  const [ownedGamesByOwnerSteamID, setOwnedGamesByOwnerSteamID] = useState<Record<string, SteamGame[]>>({})
  const [loadedPlayerSummary, setLoadedPlayerSummary] = useState<SteamUser | null>(null)
  const [friends, setFriends] = useState<string[]>([])
  const [allSteamIDs, setAllSteamIDs] = useState<string[]>([])
  const [playerSummariesBySteamID, setPlayerSummariesBySteamID] = useState<Record<string, SteamUser>>({})
  const {
    data: playerSummaries,
    error: playerSummariesError,
    isPending: loadingPlayerSummaries,
  } = useGetPlayerSummaries(allSteamIDs)

  useEffect(() => {
    if (friends && friends.length > 0) {
      let steamIDs = friends
      if (currentUser?.steamId) {
        steamIDs = steamIDs.concat(currentUser?.steamId)
      }
      setAllSteamIDs(steamIDs)
    }
  }, [friends, currentUser?.steamId])

  useEffect(() => {
    if (!loadingGames && games && currentUser?.steamId) {
      const newHash = Object.assign({}, ownedGamesByOwnerSteamID)
      newHash[currentUser?.steamId] = games
      setOwnedGamesByOwnerSteamID(newHash)
    }
  }, [games, loadingGames, currentUser?.steamId, ownedGamesByOwnerSteamID])

  useEffect(() => {
    if (!loadingPlayerSummaries && playerSummaries) {
      const hash = playerSummaries.reduce((acc, p) => {
        acc[p.steamId] = p
        return acc
      }, {} as {[steamID: string]: SteamUser})
      setPlayerSummariesBySteamID(hash)
    }
  }, [loadingPlayerSummaries, playerSummaries])

  useEffect(() => {
    if (currentUser?.steamId && playerSummariesBySteamID.hasOwnProperty(currentUser?.steamId)) {
      const playerSummary = playerSummariesBySteamID[currentUser?.steamId]
      setLoadedPlayerSummary(playerSummary)
      onPlayerSummaryChange(playerSummary)
      if (playerSummary.name && playerSummary.name !== steamUsername) {
        onUsernameChange(playerSummary.name)
      }
    }
  }, [onUsernameChange, playerSummariesBySteamID, currentUser?.steamId, onPlayerSummaryChange, steamUsername])

  useEffect(() => {
    if (!loadingPlayerSummaries && playerSummariesBySteamID && friends.length > 0) {
      for (const friend of friends) {
        if (playerSummariesBySteamID.hasOwnProperty(friend)) {
          friend.playerSummary = playerSummariesBySteamID[friend]
        }
      }
      friends.sort((a, b) => a.compare(b))
    }
  }, [loadingPlayerSummaries, playerSummariesBySteamID, friends])

  const onFriendSelectionChanged = (selectedPlayers: SteamUser[]) => {
    const steamIDs = selectedPlayers.map(player => player.steamId)
    setSelectedFriendSteamIDs(steamIDs)
    onPlayerSelectionChange(selectedPlayers)
  }

  const onFriendGamesLoaded = (friendSteamID: string, friendGames: SteamGame[]) => {
    const newHash = Object.assign({}, ownedGamesByOwnerSteamID)
    newHash[friendSteamID] = friendGames
    setOwnedGamesByOwnerSteamID(newHash)
  }

  if (!currentUser) return null

  return (
    <PageLayout>
      <PageLayout.Header>
        <SteamUserPageHeader
          playerSummary={loadedPlayerSummary}
          steamUsername={steamUsername}
          onUsernameChange={onUsernameChange}
        />
      </PageLayout.Header>
      <PageLayout.Content>
        {playerSummariesError && <Flash variant="warning">There was an error loading Steam user data.</Flash>}
        {friends.length > 0 && games && (
          <p>Choose some other players and a game to compare your achievements!</p>
        )}
        <FriendsList
          onFriendGamesLoaded={onFriendGamesLoaded}
          selectedIDs={selectedFriendSteamIDs}
          steamUsername={steamUsername}
          steamID={currentUser.steamId}
          onFriendsLoaded={list => setFriends(list)}
          onPlayerSelectionChange={selectedPlayers => onFriendSelectionChanged(selectedPlayers)}
        />
        {games && games.length > 0 && <hr />}
        {gamesError && (
          <Flash variant="warning">
            There was an error loading the list of games <strong>{steamUsername}</strong> owns.
          </Flash>
        )}
        {loadingGames && (
          <div>
            <Spinner />
            <p>Loading {steamUsername}'s games list...</p>
          </div>
        )}
        {currentUser?.steamId && games && <PlayedGamesList games={games} loadGame={loadGame} />}
      </PageLayout.Content>
    </PageLayout>
  )
}

export default SteamUserPage
