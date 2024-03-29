import React, { useState, useEffect } from 'react'
import LocalStorage from '../models/LocalStorage'
import Game from '../models/Game'
import Friend from '../models/Friend'
import Player from '../models/Player'
import PlayedGamesList from './PlayedGamesList'
import FriendsList from './FriendsList'
import PlayerSummary from '../models/PlayerSummary'
import SteamUserPageHeader from './SteamUserPageHeader'
import SteamUserError from './SteamUserError'
import useGetPlayerSummaries from '../hooks/use-get-player-summaries'
import useGetGames from '../hooks/use-get-games'
import useGetSteamID from '../hooks/use-get-steam-id'
import { PageLayout, Flash, Spinner } from '@primer/react'

interface Props {
  steamUsername: string;
  onUsernameChange(newUsername: string): void;
  onPlayerSummaryChange(newPlayerSummary: PlayerSummary): void;
  onPlayerSelectionChange(selectedPlayers: Player[]): void;
  loadGame(game: Game): void;
}

const SteamUserPage = ({ steamUsername, onUsernameChange, onPlayerSummaryChange, onPlayerSelectionChange, loadGame }: Props) => {
  const { steamID, error: steamIDError, fetching: loadingSteamID } = useGetSteamID(steamUsername)
  const { games, error: gamesError, fetching: loadingGames } = useGetGames(steamID)
  const [selectedFriendSteamIDs, setSelectedFriendSteamIDs] = useState<string[]>(LocalStorage.get('steam-selected-friends') || [])
  const [ownedGamesByOwnerSteamID, setOwnedGamesByOwnerSteamID] = useState<{ [steamID: string]: Game[] }>({})
  const [loadedPlayerSummary, setLoadedPlayerSummary] = useState<PlayerSummary | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [allSteamIDs, setAllSteamIDs] = useState<string[]>([])
  const [playerSummariesBySteamID, setPlayerSummariesBySteamID] = useState<{ [steamID: string]: PlayerSummary }>({})
  const { playerSummaries, error: playerSummariesError, fetching: loadingPlayerSummaries } = useGetPlayerSummaries(allSteamIDs)

  useEffect(() => {
    if (friends && friends.length > 0) {
      let steamIDs = friends.map(f => f.steamID)
      if (steamID) {
        steamIDs = steamIDs.concat(steamID)
      }
      setAllSteamIDs(steamIDs)
    }
  }, [friends, steamID])

  useEffect(() => {
    if (!loadingGames && games && steamID) {
      const newHash = Object.assign({}, ownedGamesByOwnerSteamID)
      newHash[steamID] = games
      setOwnedGamesByOwnerSteamID(newHash)
    }
  }, [games, loadingGames, steamID, ownedGamesByOwnerSteamID])

  useEffect(() => {
    if (!loadingPlayerSummaries && playerSummaries) {
      const hash = playerSummaries.reduce((acc, p) => {
        acc[p.steamid] = p
        return acc
      }, {} as { [steamID: string]: PlayerSummary })
      setPlayerSummariesBySteamID(hash)
    }
  }, [loadingPlayerSummaries, playerSummaries])

  useEffect(() => {
    if (steamID && playerSummariesBySteamID.hasOwnProperty(steamID)) {
      const playerSummary = playerSummariesBySteamID[steamID]
      setLoadedPlayerSummary(playerSummary)
      onPlayerSummaryChange(playerSummary)
      if (playerSummary.username && playerSummary.username !== steamUsername) {
        onUsernameChange(playerSummary.username)
      }
    }
  }, [onUsernameChange, playerSummariesBySteamID, steamID, onPlayerSummaryChange, steamUsername])

  useEffect(() => {
    if (!loadingPlayerSummaries && playerSummariesBySteamID && friends.length > 0) {
      for (const friend of friends) {
        if (playerSummariesBySteamID.hasOwnProperty(friend.steamID)) {
          friend.playerSummary = playerSummariesBySteamID[friend.steamID]
        }
      }
      friends.sort((a, b) => a.compare(b))
    }
  }, [loadingPlayerSummaries, playerSummariesBySteamID, friends])

  const onFriendSelectionChanged = (selectedPlayers: Player[]) => {
    const steamIDs = selectedPlayers.map(player => player.steamid)
    LocalStorage.set('steam-selected-friends', steamIDs)
    setSelectedFriendSteamIDs(steamIDs)
    onPlayerSelectionChange(selectedPlayers)
  }

  const onFriendGamesLoaded = (friendSteamID: string, friendGames: Game[]) => {
    const newHash = Object.assign({}, ownedGamesByOwnerSteamID)
    newHash[friendSteamID] = friendGames
    setOwnedGamesByOwnerSteamID(newHash)
  }

  return <PageLayout>
    <PageLayout.Header>
      <SteamUserPageHeader playerSummary={loadedPlayerSummary} steamUsername={steamUsername}
        onUsernameChange={onUsernameChange} />
    </PageLayout.Header>
    <PageLayout.Content>
      {steamIDError && <SteamUserError />}
      {playerSummariesError && <Flash variant="warning">There was an error loading Steam user data.</Flash>}
      {loadingSteamID && <Spinner />}
      {steamID && friends.length > 0 && games && <p>
        Choose some other players and a game to compare your achievements!
      </p>}
      {steamID && <FriendsList onFriendGamesLoaded={onFriendGamesLoaded} selectedIDs={selectedFriendSteamIDs}
        steamUsername={steamUsername} steamID={steamID} onFriendsLoaded={list => setFriends(list)}
        onPlayerSelectionChange={selectedPlayers => onFriendSelectionChanged(selectedPlayers)}
      />}
      {games && games.length > 0 && <hr />}
      {gamesError && <Flash variant="warning">
        There was an error loading the list of games <strong>{steamUsername}</strong> owns.
      </Flash>}
      {loadingGames && <div>
        <Spinner />
        <p>Loading {steamUsername}'s games list...</p>
      </div>}
      {steamID && games && <PlayedGamesList games={games} loadGame={loadGame} />}
    </PageLayout.Content>
  </PageLayout>
}

export default SteamUserPage;
