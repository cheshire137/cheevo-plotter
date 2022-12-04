import React, { useState, useEffect } from 'react'
import LocalStorage from '../models/LocalStorage'
import Game from '../models/Game'
import SteamApi from '../models/SteamApi'
import Friend from '../models/Friend'
import PlayedGamesList from './PlayedGamesList'
import FriendsList from './FriendsList'
import PlayerSummary from '../models/PlayerSummary'
import SteamUserPageHeader from './SteamUserPageHeader'
import SteamUserError from './SteamUserError'
import useGetPlayerSummaries from '../hooks/use-get-player-summaries'
import useGetGames from '../hooks/use-get-games'
import useGetSteamID from '../hooks/use-get-steam-id'

interface Props {
  steamUsername: string;
  onUsernameChange(newUsername: string): void;
  loadGame(game: Game): void;
}

const SteamUserPage = ({ steamUsername, onUsernameChange, loadGame }: Props) => {
  const { steamID, error: steamIDError, fetching: loadingSteamID } = useGetSteamID(steamUsername)
  const { games, error: gamesError, fetching: loadingGames } = useGetGames(steamID)
  const [gamesByAppID, setGamesByAppID] = useState<{ [appID: string]: Game }>({})
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
    if (!loadingGames && games) {
      setGamesByAppID(games.reduce((acc: { [appID: string]: Game }, game: Game) => {
        acc[game.appID] = game
        return acc
      }, {}))

      if (steamID) {
        const newHash = Object.assign({}, ownedGamesByOwnerSteamID)
        newHash[steamID] = games
        setOwnedGamesByOwnerSteamID(newHash)
      }
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
      if (playerSummary.username && playerSummary.username !== steamUsername) {
        onUsernameChange(playerSummary.username)
      }
    }
  }, [onUsernameChange, playerSummariesBySteamID, steamID, steamUsername])

  useEffect(() => {
    if (!loadingPlayerSummaries && playerSummariesBySteamID && friends.length > 0) {
      for (const friend of friends) {
        if (playerSummariesBySteamID.hasOwnProperty(friend.steamID)) {
          friend.playerSummary = playerSummariesBySteamID[friend.steamID]
        }
      }
    }
  }, [loadingPlayerSummaries, playerSummariesBySteamID, friends])

  const onFriendSelectionChanged = (selectedFriendSteamIDs: string[]) => {
    LocalStorage.set('steam-selected-friends', selectedFriendSteamIDs);
  }

  const onFriendGamesLoaded = (friendSteamID: string, friendGames: Game[]) => {
    const newHash = Object.assign({}, ownedGamesByOwnerSteamID)
    newHash[friendSteamID] = friendGames
    setOwnedGamesByOwnerSteamID(newHash)
  }

  return <div>
    <SteamUserPageHeader playerSummary={loadedPlayerSummary} steamUsername={steamUsername}
      onUsernameChange={onUsernameChange} />
    {steamIDError && <SteamUserError />}
    {steamID && friends.length > 0 && games && <p>
      Choose some other players and a game to compare your achievements!
    </p>}
    {steamID && <FriendsList onFriendGamesLoaded={onFriendGamesLoaded}
      steamUsername={steamUsername} steamID={steamID} onFriendsLoaded={list => setFriends(list)}
      onSelectionChange={list => onFriendSelectionChanged(list)}
    />}
    {games && games.length > 0 && <hr />}
    {gamesError && <p>There was an error loading the list of games <strong>{steamUsername}</strong> owns.</p>}
    {loadingGames && <p>Loading {steamUsername}'s games list...</p>}
    {steamID && games && <PlayedGamesList games={games} loadGame={loadGame} />}
  </div>
}

export default SteamUserPage;
