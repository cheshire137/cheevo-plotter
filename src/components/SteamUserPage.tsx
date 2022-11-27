import React, { useState, useEffect } from 'react';
import LocalStorage from '../models/LocalStorage';
import SteamApi from '../models/SteamApi';
import PlayedGamesList from './PlayedGamesList';
import SteamApps from '../stores/steamApps';
import FriendsList from './FriendsList';
import { setConstantValue } from 'typescript';

interface Props {
  steamUsername: string;
  onUsernameChange(newUsername: string): void;
}

const SteamUserPage = ({ steamUsername, onUsernameChange }: Props) => {
  const [ownedGames, setOwnedGames] = useState<any>({});
  const [steamID, setSteamID] = useState("");
  const [steamIDError, setSteamIDError] = useState(false);
  const [friendsError, setFriendsError] = useState(false)
  const [games, setGames] = useState<any[]>([])
  const [gamesError, setGamesError] = useState(false)
  const [playerSummary, setPlayerSummary] = useState<any | null>(null)
  const [friends, setFriends] = useState<any[]>([])

  const clearSteamUsername = (event: React.MouseEvent) => {
    event.preventDefault();
    LocalStorage.delete('steam-id');
    LocalStorage.delete('steam-username');
    LocalStorage.delete('steam-games');
    LocalStorage.delete('steam-selected-friends');
    onUsernameChange('')
  }

  const getUsernameFromProfileUrl = (profileUrl: string) => {
    const needle = '/id/';
    const index = profileUrl.toLowerCase().indexOf(needle);
    if (index > -1) {
      return profileUrl.slice(index + needle.length).replace(/\/+$/, '');
    }
  }

  const updateSharedGames = (gamesBySteamId: any[]) => {
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

  const organizeGamesResponse = (data: any) => {
    var games = data.response.games;
    var playedGames = [];
    for (var i = 0; i < games.length; i++) {
      var game = games[i];
      if (game.playtime_forever > 0) {
        playedGames.push(game.appid);
      }
    }
    return SteamApps.sortIds(playedGames);
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
    fetchFriendGames(selectedFriends, newOwnedGames);
  }

  const fetchGames = async (steamIDToFetch: string) => {
    const games = LocalStorage.get('steam-games');
    const newOwnedGames = Object.assign({}, ownedGames)
    if (typeof games === 'object') {
      newOwnedGames[steamIDToFetch] = games;
      setOwnedGames(newOwnedGames)
      updateSharedGames(newOwnedGames)
      return
    }

    let data
    try {
      data = SteamApi.getOwnedGames(steamIDToFetch)
    } catch (err) {
      console.error('failed to fetch Steam games for ' + steamIDToFetch, err);
      setGamesError(true)
      return
    }

    const playedGames = organizeGamesResponse(data)
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
    for (const friendSteamID of selectedFriends) {
      if (knownFriends.indexOf(friendSteamID) < 0) {
        let data
        try {
          data = await SteamApi.getOwnedGames(friendSteamID)
        } catch (err) {
          console.error('failed to fetch Steam games for friend ' + friendSteamID, err);
          delete newOwnedGames[friendSteamID]
          setOwnedGames(newOwnedGames)
          updateSharedGames(newOwnedGames)
          continue
        }
        newOwnedGames[friendSteamID] = organizeGamesResponse(data)
        setOwnedGames(newOwnedGames)
        updateSharedGames(newOwnedGames)
      }
    }
  }

  const fetchFriends = async (steamId: string) => {
    let data: any
    try {
      data = await SteamApi.getFriends(steamId)
    } catch (err) {
      console.error('failed to fetch Steam friends', err);
      setFriendsError(true)
      return
    }

    const friendIds = data.friendslist.friends.map((f: any) => f.steamid).concat([steamId]);
    let summaries: any
    try {
      summaries = SteamApi.getPlayerSummaries(friendIds)
      setFriendsError(false)
    } catch (err) {
      console.error('failed to fetch friend summaries', err);
      return
    }

    // See https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
    // communityvisibilitystate 3 means the profile is public.
    // Need public profiles to see owned/played games for comparison.
    const publicFriends = summaries.filter((p: any) => p.communityvisibilitystate === 3 && p.steamid !== steamId);
    const loadedPlayerSummary = summaries.filter((p: any) => p.steamid === steamId)[0];
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

  useEffect(() => {
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
  }, [setSteamIDError, fetchSteamID, fetchFriends, fetchGames, organizeGamesResponse, fetchStoredFriendGames, setOwnedGames, setSteamID])

  const selectedSteamIds = Object.keys(ownedGames);
  const haveSteamId = typeof steamID !== 'undefined';
  const haveGamesList = typeof games === 'object';
  const haveFriendsList = typeof friends === 'object';
  const havePlayerSummary = typeof playerSummary === 'object';
  const haveRealName = havePlayerSummary && typeof playerSummary.realname === 'string' && playerSummary.realname.length > 0;
  const profileUrl = havePlayerSummary ? playerSummary.profileurl : 'https://steamcommunity.com/id/' + encodeURIComponent(steamUsername) + '/';
  return (
    <div>
      <div>
        <h1>
          <button onClick={e => clearSteamUsername(e)}>&laquo;</button>
          Steam
          <span> / </span>
          {havePlayerSummary ? (
            <a href={profileUrl} target="_blank">
              <img src={playerSummary.avatarmedium}
                alt={playerSummary.steamid} />
              <span> {playerSummary.personaname} </span>
              {haveRealName ? <span>{playerSummary.realname}</span> : null}
            </a>
          ) : (
            <a href={profileUrl} target="_blank">{steamUsername}</a>
          )}
        </h1>
        {steamIDError ? (
          <div>
            <p>
              Could not find Steam ID for that username.
            </p>
            <p>
              Try setting your custom URL in Steam:
            </p>
            <p>
              <img src={require('./steam-edit-profile.jpg')} width="640"
                    height="321" alt="Edit Steam profile" />
            </p>
            <p>
              Then, search here for the name you set in that custom URL.
            </p>
          </div>
        ) : null}
        {haveSteamId && haveFriendsList && haveGamesList ? (
          <p>
            Choose some other players and a game to compare your achievements!
          </p>
        ) : null}
        {haveSteamId && haveFriendsList ? (
          <FriendsList selectedIds={selectedSteamIds}
                        username={steamUsername}
                        friends={friends}
                        onSelectionChange={(sf: any[]) => onFriendSelectionChanged(sf)} />
        ) : haveSteamId ? friendsError ? (
          <p>There was an error loading the friends list.</p>
        ) : <p>Loading friends list...</p> : null}
        {haveFriendsList && haveGamesList ? <hr /> : null}
        {haveSteamId ? haveGamesList ? (
          <PlayedGamesList steamId={steamID} games={games} username={steamUsername} />
        ) : gamesError ? (
          <p>
            There was an error loading the list of games
            <strong> {steamUsername} </strong>
            owns.
          </p>
        ) : (
          <p>Loading games list...</p>
        ) : steamIDError ? null : <p>Loading...</p>}
      </div>
    </div>
  );
}

export default SteamUserPage;
