import React, { useState, useEffect } from 'react';
import LocalStorage from '../models/LocalStorage'
import SteamApi from '../models/SteamApi';
import SteamApps from '../stores/steamApps';
import AchievementsList from './AchievementsList';
import AchievementsComparison from './AchievementsComparison';
import PlayersList from './PlayersList';

interface Props {
  steamUsername: string;
  appID: number;
  onUsernameChange(newUsername: string): void;
}

const SteamGamePage = ({ steamUsername, appID, onUsernameChange }: Props) => {
  const [selectedIDs, setSelectedIDs] = useState<string[]>([])
  const [gameName, setGameName] = useState("")
  const [steamID, setSteamID] = useState("")
  const [players, setPlayers] = useState<any[] | null>(null)
  const [achievements, setAchievements] = useState<any>({})
  const [achievementLoadCount, setAchievementLoadCount] = useState(0)
  const [iconURI, setIconURI] = useState<string | null>(null)
  const gameUrl = 'https://steamcommunity.com/app/' + appID
  const profileUrl = 'https://steamcommunity.com/id/' + steamUsername + '/'
  const onlyOneUser = selectedIDs.length === 1
  const haveAchievements = typeof achievements === 'object' && achievementLoadCount === selectedIDs.length
  const havePlayers = typeof players === 'object' && players !== null
  const achievementCount = haveAchievements ? achievements[steamID].length : 0

  useEffect(() => {
    setSelectedIDs(LocalStorage.get('steam-selected-friends') || [LocalStorage.get('steam-id')])

    const playerSteamId = LocalStorage.get('steam-id');
    if (typeof playerSteamId === 'undefined') {
      LocalStorage.delete('steam-games');
      LocalStorage.delete('steam-selected-friends');
      onUsernameChange(steamUsername);
      return;
    }

    setGameName(SteamApps.getName(appID))
    setSteamID(playerSteamId)


    const getAchievements = async () => {
      for (const selectedSteamID of selectedIDs) {
        let data
        try {
          data = await SteamApi.getAchievements(selectedSteamID, appID)
        } catch (err) {
          console.error('failed to load achievements list for ' + selectedSteamID, err);
          const newAchievements = Object.assign({}, achievements)
          newAchievements[selectedSteamID] = [];
          setAchievements(newAchievements)
          setAchievementLoadCount(achievementLoadCount + 1)
          continue
        }
        setAchievementLoadCount(achievementLoadCount + 1)
        const newAchievements = Object.assign({}, achievements)
        newAchievements[selectedSteamID] = data.achievements;
        setAchievements(newAchievements)
        if (data.hasOwnProperty('iconUri')) {
          setIconURI(data.iconUri)
        }
      }
    }

    const getPlayerSummaries = async () => {
      let playerSummaries
      try {
        playerSummaries = await SteamApi.getPlayerSummaries(selectedIDs)
        setPlayers(playerSummaries)
      } catch (err) {
        console.error('failed to load player summaries', err)
      }
    }

    getAchievements()
    getPlayerSummaries()
  }, [setSelectedIDs, setGameName, setSteamID, steamUsername, achievementLoadCount, selectedIDs, achievements, appID, onUsernameChange])

  const clearSteamGame = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  return <div>
    <h1>
      <button onClick={e => clearSteamGame(e)}>&laquo;</button>
      {typeof iconURI === 'string' ? <img src={iconURI} alt={gameName} /> : null}
      Steam / <a href={profileUrl} rel="noreferrer" target="_blank"> {steamUsername} </a> /
      <a href={gameUrl} rel="noreferrer" target="_blank"> {gameName}</a>
      {haveAchievements && achievementCount > 0 ? (
        <span>
          <span>{achievementCount}</span>
          <span>{achievementCount === 1 ? 'achievement' : 'achievements'}</span>
        </span>
      ) : null}
    </h1>
    {havePlayers ? onlyOneUser ? null : <PlayersList players={players} currentSteamId={steamID}
      achievements={achievements} /> : <p>Loading player data...</p>}
    {haveAchievements ? onlyOneUser ? <AchievementsList
      achievements={achievements[steamID]} />
     : havePlayers ? <AchievementsComparison players={players} steamId={steamID}
      achievementsBySteamId={achievements} /> : null : <p>Loading achievements...</p>}
  </div>
}

export default SteamGamePage;
