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

  const getAchievements = async () => {
    for (const selectedSteamID of selectedIDs) {
      let data
      try {
        data = await SteamApi.getAchievements(selectedSteamID, appID)
      } catch (err) {
        continue
      }
      setAchievementLoadCount(achievementLoadCount + 1)
      const newAchievements = Object.assign({}, achievements)
      newAchievements[selectedSteamID] = data.achievements;
      setAchievements(newAchievements)
      setIconURI(data.iconUri)
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
    getAchievements()
    getPlayerSummaries()
  }, [setSelectedIDs, setGameName, setSteamID, getAchievements, getPlayerSummaries, appID, onUsernameChange])

  onAchievementsError(steamId, err) {
    console.error('failed to load achievements list for ' + steamId, err);
    var achievements = this.state.achievements || {};
    var loadCount = this.state.achievementLoadCount;
    if (typeof loadCount === 'undefined') {
      loadCount = 0;
    }
    loadCount++;
    achievements[steamId] = [];
    this.setState({achievements: achievements,
                   achievementLoadCount: loadCount});
  }

  render() {
    const gameUrl = 'https://steamcommunity.com/app/' + appID;
    const profileUrl = 'https://steamcommunity.com/id/' +
                       this.props.username + '/';
    const onlyOneUser = selectedIDs.length === 1;
    const haveAchievements = typeof this.state.achievements === 'object' &&
        this.state.achievementLoadCount === selectedIDs.length;
    const havePlayers = typeof this.state.players === 'object';
    const achievementCount = haveAchievements ?
        this.state.achievements[this.state.steamId].length : 0;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            <Link to={'/steam/' + this.props.username}
                  className={s.clearSteamGame}>
              &laquo;
            </Link>
            {typeof this.state.iconUri === 'string' ? (
              <img src={this.state.iconUri} alt={this.state.gameName}
                   className={s.gameIcon} />
            ) : ''}
            Steam /
            <a href={profileUrl} target="_blank"> {this.props.username} </a>
            /
            <a href={gameUrl} target="_blank"> {this.state.gameName}</a>
            {haveAchievements && achievementCount > 0 ? (
              <span className={s.achievementCount}>
                <span className={s.count}>{achievementCount}</span>
                <span className={s.units}>
                  {achievementCount === 1 ? 'achievement' : 'achievements'}
                </span>
              </span>
            ) : ''}
          </h1>
          {havePlayers ? onlyOneUser ? '' : (
            <PlayersList players={this.state.players}
                         currentSteamId={this.state.steamId}
                         achievements={this.state.achievements} />
          ) : (
            <p>Loading player data...</p>
          )}
          {haveAchievements ? onlyOneUser ? (
            <AchievementsList
                achievements={this.state.achievements[this.state.steamId]} />
          ) : havePlayers ? (
            <AchievementsComparison players={this.state.players}
                steamId={this.state.steamId}
                achievementsBySteamId={this.state.achievements} />
          ) : '' : (
            <p>Loading achievements...</p>
          )}
        </div>
      </div>
    );
  }
}

export default SteamGamePage;
