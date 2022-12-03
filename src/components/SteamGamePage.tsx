import React, { useState, useEffect } from 'react'
import LocalStorage from '../models/LocalStorage'
import Game from '../models/Game'
import SteamApi from '../models/SteamApi'
import AchievementsList from './AchievementsList'
import AchievementsComparison from './AchievementsComparison'
import PlayersList from './PlayersList'

interface Props {
  steamUsername: string;
  game: Game;
  onUsernameChange(newUsername: string): void;
}

const SteamGamePage = ({ steamUsername, game, onUsernameChange }: Props) => {
  const [selectedIDs, setSelectedIDs] = useState<string[]>([])
  const [steamID, setSteamID] = useState("")
  const [players, setPlayers] = useState<any[] | null>(null)
  const [achievements, setAchievements] = useState<any>({})
  const [achievementLoadCount, setAchievementLoadCount] = useState(0)
  const [iconURI, setIconURI] = useState<string | null>(null)
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

    setSteamID(playerSteamId)

    const getAchievements = async () => {
      for (const selectedSteamID of selectedIDs) {
        let data
        try {
          data = await SteamApi.getAchievements(selectedSteamID, game.appID)
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
  }, [setSelectedIDs, setSteamID, steamUsername, achievementLoadCount, selectedIDs, achievements, game, onUsernameChange])

  const clearSteamGame = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  return <div>
    <h1>
      <button onClick={e => clearSteamGame(e)}>&laquo;</button>
      {typeof iconURI === 'string' ? <img src={iconURI} alt={game.name} /> : null}
      Steam / <a href={profileUrl} rel="noreferrer" target="_blank"> {steamUsername} </a> /
      <a href={game.url} rel="noreferrer" target="_blank"> {game.name}</a>
      {haveAchievements && achievementCount > 0 ? <>
        <span>{achievementCount}</span>
        <span>{achievementCount === 1 ? 'achievement' : 'achievements'}</span>
      </> : null}
    </h1>
    {havePlayers ? onlyOneUser ? null : <PlayersList players={players} currentSteamID={steamID}
      achievements={achievements} onUsernameChange={onUsernameChange} /> : <p>Loading player data...</p>}
    {haveAchievements ? onlyOneUser ? <AchievementsList
      achievements={achievements[steamID]} /> : havePlayers ? <AchievementsComparison initialPlayers={players}
      achievementsBySteamID={achievements} /> : null : <p>Loading achievements...</p>}
  </div>
}

export default SteamGamePage;
