import React, { useState, useEffect } from 'react'
import LocalStorage from '../models/LocalStorage'
import Game from '../models/Game'
import SteamApi from '../models/SteamApi'
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

const getUsernameFromProfileUrl = (profileUrl: string) => {
  const needle = '/id/';
  const index = profileUrl.toLowerCase().indexOf(needle);
  if (index > -1) {
    return profileUrl.slice(index + needle.length).replace(/\/+$/, '');
  }
}

const SteamUserPage = ({ steamUsername, onUsernameChange, loadGame }: Props) => {
  const [ownedGames, setOwnedGames] = useState<any>({})
  const { steamID, error: steamIDError, fetching: loadingSteamID } = useGetSteamID(steamUsername)
  const { games, error: gamesError, fetching: loadingGames } = useGetGames(steamID)
  const [loadedPlayerSummary, setLoadedPlayerSummary] = useState<PlayerSummary | null>(null)
  const [friendGamesError, setFriendGamesError] = useState(false)
  const [friendSteamIDs, setFriendSteamIDs] = useState<string[]>([])
  let idsToLoadPlayerSummaries = [...friendSteamIDs]
  if (steamID) {
    idsToLoadPlayerSummaries.push(steamID)
  }
  const { playerSummaries, error: playerSummariesError, fetching: loadingPlayerSummaries } = useGetPlayerSummaries(idsToLoadPlayerSummaries)
  const selectedSteamIDs = Object.keys(ownedGames)

  useEffect(() => {
    if (!loadingPlayerSummaries && playerSummaries) {
      const playerSummary = playerSummaries.filter((p: any) => p.steamid === steamID)[0];
      playerSummary.username = getUsernameFromProfileUrl(playerSummary.profileurl) || steamUsername;
      setLoadedPlayerSummary(playerSummary)
      if (playerSummary.username !== steamUsername) {
        onUsernameChange(playerSummary.username)
      }
    }
  }, [loadingPlayerSummaries, playerSummaries, steamID, steamUsername, onUsernameChange])

  const updateSharedGames = (gamesBySteamId: { [steamID: string]: any }) => {
    gamesBySteamId = gamesBySteamId || ownedGames;
    const gamesList: any[] = [];
    for (var steamId in gamesBySteamId) {
      gamesList.push(ownedGames[steamId]);
    }
    gamesList.sort((a, b) => a.length - b.length)
    // var sharedGames;
    // if (gamesList.length < 2) {
    //   sharedGames = gamesList[0];
    // } else {
    //   sharedGames = gamesList.shift().filter((v: any) => gamesList.every((a) => a.indexOf(v) > -1));
    // }
    // setGames(sharedGames)
  }

  const onFriendSelectionChanged = (selectedFriends: any[]) => {
    LocalStorage.set('steam-selected-friends', selectedFriends);
    const newOwnedGames = Object.assign({}, ownedGames)
    if (typeof steamID !== 'undefined') {
      for (var friendSteamID in ownedGames) {
        if (selectedFriends.indexOf(friendSteamID) < 0 && friendSteamID !== steamID) {
          delete newOwnedGames[friendSteamID];
        }
      }
      updateSharedGames(newOwnedGames);
      setOwnedGames(newOwnedGames)
    }
    const knownFriends = [];
    for (const friendSteamID in ownedGames) {
      if (ownedGames[friendSteamID].length > 0) {
        knownFriends.push(friendSteamID);
      }
    }
    const fetchKnownFriendGames = async (steamIDToFetch: string) => {
      if (friendGamesError) return

      let friendGames
      try {
        friendGames = await SteamApi.getOwnedGames(steamIDToFetch)
      } catch (err) {
        console.error('failed to fetch Steam games for friend ' + steamIDToFetch, err);
        delete newOwnedGames[steamIDToFetch]
        setOwnedGames(newOwnedGames)
        updateSharedGames(newOwnedGames)
        setFriendGamesError(true)
        return
      }
      newOwnedGames[steamIDToFetch] = friendGames
      setOwnedGames(newOwnedGames)
      updateSharedGames(newOwnedGames)
      setFriendGamesError(false)
    }
    for (const friendSteamID of selectedFriends) {
      if (knownFriends.indexOf(friendSteamID) < 0) {
        fetchKnownFriendGames(friendSteamID)
      }
    }
  }

  useEffect(() => {
    // const fetchGames = async (steamIDToFetch: string) => {
    //   if (gamesError) return

    //   const games = LocalStorage.get('steam-games');
    //   const newOwnedGames = Object.assign({}, ownedGames)
    //   if (typeof games === 'object') {
    //     newOwnedGames[steamIDToFetch] = games;
    //     setOwnedGames(newOwnedGames)
    //     updateSharedGames(newOwnedGames)
    //     return
    //   }

    //   let playedGames
    //   try {
    //     playedGames = await SteamApi.getOwnedPlayedGames(steamIDToFetch)
    //   } catch (err) {
    //     console.error('failed to fetch Steam games for ' + steamIDToFetch, err);
    //     setGamesError(true)
    //     return
    //   }

    //   LocalStorage.set('steam-games', playedGames)
    //   newOwnedGames[steamIDToFetch] = playedGames
    //   setOwnedGames(newOwnedGames)
    //   setGamesError(false)
    //   updateSharedGames(newOwnedGames)
    // }

    const fetchFriendGames = async (selectedFriends: any[], knownOwnedGames: any[]) => {
      const newOwnedGames = Object.assign({}, knownOwnedGames)
      const knownFriends = [];
      for (const friendSteamID in ownedGames) {
        if (ownedGames[friendSteamID].length > 0) {
          knownFriends.push(friendSteamID);
        }
      }

      if (friendGamesError) return

      for (const friendSteamID of selectedFriends) {
        if (knownFriends.indexOf(friendSteamID) < 0) {
          let friendGames
          try {
            friendGames = await SteamApi.getOwnedGames(friendSteamID)
          } catch (err) {
            console.error('failed to fetch Steam games for friend ' + friendSteamID, err);
            delete newOwnedGames[friendSteamID]
            setOwnedGames(newOwnedGames)
            updateSharedGames(newOwnedGames)
            setFriendGamesError(true)
            continue
          }
          newOwnedGames[friendSteamID] = friendGames
          setOwnedGames(newOwnedGames)
          updateSharedGames(newOwnedGames)
          setFriendGamesError(false)
        }
      }
    }

    const fetchStoredFriendGames = () => {
      const friendIds = LocalStorage.get('steam-selected-friends');
      if (typeof friendIds !== 'object') {
        return;
      }
      fetchFriendGames(friendIds, ownedGames)
    }

    // const fetchSteamID = async () => {
    //   let data
    //   try {
    //     data = await SteamApi.getSteamId(steamUsername);
    //     setSteamIDError(false)
    //   } catch (err) {
    //     console.error('failed to fetch Steam ID from username', err);
    //     setSteamIDError(true)
    //     return
    //   }
    //   var fetchedSteamID = data.response.steamid;
    //   LocalStorage.set('steam-id', fetchedSteamID);
    //   setSteamID(fetchedSteamID)
    //   fetchGames(fetchedSteamID);
    // }

    const selectedFriends = LocalStorage.get('steam-selected-friends');
    if (typeof selectedFriends === 'object') {
      const newOwnedGames: any[] = []
      for (var i = 0; i < selectedFriends.length; i++) {
        newOwnedGames[selectedFriends[i]] = [];
      }
      setOwnedGames(newOwnedGames)
    }

    const rememberedSteamID = LocalStorage.get('steam-id');
    if (typeof rememberedSteamID === 'undefined' || rememberedSteamID.length < 1) {
      // fetchSteamID();
    } else {
      // fetchGames(rememberedSteamID);
      fetchStoredFriendGames();
      // setSteamID(rememberedSteamID)
    }
  }, [steamUsername, onUsernameChange, friendGamesError, gamesError, updateSharedGames, ownedGames, setOwnedGames])

  return <div>
    <SteamUserPageHeader playerSummary={loadedPlayerSummary} steamUsername={steamUsername}
      onUsernameChange={onUsernameChange} />
    {steamIDError && <SteamUserError />}
    {steamID && friendSteamIDs && games && <p>
      Choose some other players and a game to compare your achievements!
    </p>}
    {steamID && <FriendsList initiallySelectedIDs={selectedSteamIDs}
      steamUsername={steamUsername} steamID={steamID} onFriendSteamIDsLoaded={ids => setFriendSteamIDs(ids)}
      onSelectionChange={(sf: any[]) => onFriendSelectionChanged(sf)}
    />}
    {games ? <hr /> : null}
    {steamID ? games ? <PlayedGamesList games={games} loadGame={loadGame} /> : gamesError ?
      <p>There was an error loading the list of games <strong>{steamUsername}</strong> owns.</p>
     : <p>Loading games list...</p> : steamIDError ? null : <p>Loading...</p>}
  </div>
}

export default SteamUserPage;
