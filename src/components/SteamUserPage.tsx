import React, { useState, useEffect } from 'react'
import LocalStorage from '../models/LocalStorage'
import Game from '../models/Game'
import SteamApi from '../models/SteamApi'
import PlayedGamesList from './PlayedGamesList'
import FriendsList from './FriendsList'
import PlayerSummary from '../models/PlayerSummary'
import SteamUserPageHeader from './SteamUserPageHeader'

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
  const [steamID, setSteamID] = useState<string | null>(null)
  const [steamIDError, setSteamIDError] = useState(false)
  const [friendsError, setFriendsError] = useState(false)
  const [games, setGames] = useState<Game[] | null>(null)
  const [gamesError, setGamesError] = useState(false)
  const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null)
  const [friends, setFriends] = useState<any[] | null>(null)
  const [friendGamesError, setFriendGamesError] = useState(false)
  const selectedSteamIDs = Object.keys(ownedGames)

  const updateSharedGames = (gamesBySteamId: { [steamID: string]: any }) => {
    gamesBySteamId = gamesBySteamId || ownedGames;
    const gamesList: any[] = [];
    for (var steamId in gamesBySteamId) {
      gamesList.push(ownedGames[steamId]);
    }
    gamesList.sort((a, b) => a.length - b.length)
    var sharedGames;
    if (gamesList.length < 2) {
      sharedGames = gamesList[0];
    } else {
      sharedGames = gamesList.shift().filter((v: any) => gamesList.every((a) => a.indexOf(v) > -1));
    }
    setGames(sharedGames)
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
    const fetchGames = async (steamIDToFetch: string) => {
      if (gamesError) return

      const games = LocalStorage.get('steam-games');
      const newOwnedGames = Object.assign({}, ownedGames)
      if (typeof games === 'object') {
        newOwnedGames[steamIDToFetch] = games;
        setOwnedGames(newOwnedGames)
        updateSharedGames(newOwnedGames)
        return
      }

      let playedGames
      try {
        playedGames = await SteamApi.getOwnedPlayedGames(steamIDToFetch)
      } catch (err) {
        console.error('failed to fetch Steam games for ' + steamIDToFetch, err);
        setGamesError(true)
        return
      }

      LocalStorage.set('steam-games', playedGames)
      newOwnedGames[steamIDToFetch] = playedGames
      setOwnedGames(newOwnedGames)
      setGamesError(false)
      updateSharedGames(newOwnedGames)
    }

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

    const fetchFriends = async (steamID: string) => {
      if (friendsError) return

      let data: any
      try {
        data = await SteamApi.getFriends(steamID)
      } catch (err) {
        console.error('failed to fetch Steam friends', err);
        setFriendsError(true)
        return
      }

      const friendIds = data.friendslist.friends.map((f: any) => f.steamid).concat([steamID]);
      let summaries: any
      try {
        summaries = await SteamApi.getPlayerSummaries(friendIds)
        setFriendsError(false)
      } catch (err) {
        console.error('failed to fetch friend summaries', err);
        return
      }

      // See https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
      // communityvisibilitystate 3 means the profile is public.
      // Need public profiles to see owned/played games for comparison.
      const publicFriends = summaries.filter((p: any) => p.communityvisibilitystate === 3 && p.steamid !== steamID);
      const loadedPlayerSummary = summaries.filter((p: any) => p.steamid === steamID)[0];
      loadedPlayerSummary.username = getUsernameFromProfileUrl(loadedPlayerSummary.profileurl) || steamUsername;
      setPlayerSummary(loadedPlayerSummary)
      setFriends(publicFriends)
      if (loadedPlayerSummary.username !== steamUsername) {
        onUsernameChange(loadedPlayerSummary.username)
      }
    }

    const fetchStoredFriendGames = () => {
      const friendIds = LocalStorage.get('steam-selected-friends');
      if (typeof friendIds !== 'object') {
        return;
      }
      fetchFriendGames(friendIds, ownedGames)
    }

    const fetchSteamID = async () => {
      let data
      try {
        data = await SteamApi.getSteamId(steamUsername);
        setSteamIDError(false)
      } catch (err) {
        console.error('failed to fetch Steam ID from username', err);
        setSteamIDError(true)
        return
      }
      var fetchedSteamID = data.response.steamid;
      LocalStorage.set('steam-id', fetchedSteamID);
      setSteamID(fetchedSteamID)
      fetchFriends(fetchedSteamID);
      fetchGames(fetchedSteamID);
    }

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
      fetchSteamID();
    } else {
      fetchFriends(rememberedSteamID);
      fetchGames(rememberedSteamID);
      fetchStoredFriendGames();
      setSteamID(rememberedSteamID)
    }
  }, [setSteamIDError, steamUsername, onUsernameChange, updateSharedGames, ownedGames, setOwnedGames, setSteamID])

  return <div>
    <SteamUserPageHeader playerSummary={playerSummary} steamUsername={steamUsername}
      onUsernameChange={onUsernameChange} />
    {steamIDError ? <div>
      <p>Could not find Steam ID for that username.</p>
      <p>Try setting your custom URL in Steam:</p>
      <p><img src={require('./steam-edit-profile.jpg')} width="640" height="321" alt="Edit Steam profile" /></p>
      <p>Then, search here for the name you set in that custom URL.</p>
    </div> : null}
    {steamID && friends && games ? <p>
      Choose some other players and a game to compare your achievements!
    </p> : null}
    {steamID && friends ? <FriendsList initiallySelectedIDs={selectedSteamIDs}
      steamUsername={steamUsername} friends={friends}
      onSelectionChange={(sf: any[]) => onFriendSelectionChanged(sf)}
    /> : steamID ? friendsError
      ? <p>There was an error loading the friends list.</p>
      : <p>Loading friends list...</p> : null}
    {friends && games ? <hr /> : null}
    {steamID ? games ? (
      <PlayedGamesList games={games} loadGame={loadGame} />
    ) : gamesError ? (
      <p>There was an error loading the list of games <strong>{steamUsername}</strong> owns.</p>
    ) : (
      <p>Loading games list...</p>
    ) : steamIDError ? null : <p>Loading...</p>}
  </div>
}

export default SteamUserPage;
