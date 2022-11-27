import React, { useState } from 'react';
import AchievementComparison from './AchievementComparison';
import UnlockedBarChart from './UnlockedBarChart';
import Filters from './Filters';

interface Props {
  initialPlayers: any[];
  achievementsBySteamID: any;
}

const getInitialHashOfPlayers = (initialPlayers: any[]) => {
  const players: any = {};
  for (const player of initialPlayers) {
    players[player.steamid] = player
  }
  return players
}

const getMasterListOfAchievements = (achievementsBySteamID: any) => {
  const achievements = []
  for (var steamID in achievementsBySteamID) {
    for (var i = 0; i < achievementsBySteamID[steamID].length; i++) {
      var achievement = achievementsBySteamID[steamID][i]
      var inList = false
      for (var j = 0; j < achievements.length; j++) {
        if (achievements[j].key === achievement.key) {
          inList = true
          achievements[j].players[steamID] = { isUnlocked: achievement.isUnlocked, iconUri: achievement.iconUri }
          break
        }
      }
      if (!inList) {
        const players: any = {}
        players[steamID] = { isUnlocked: achievement.isUnlocked, iconUri: achievement.iconUri }
        achievements.push({ key: achievement.key, name: achievement.name, players: players })
      }
    }
  }
  return achievements
}

const setIconUriOnAchievements = (achievements: any[]) => {
  for (var i = 0; i < achievements.length; i++) {
    var achievement = achievements[i];
    var isUnlocked = false, unlockedUri, lockedUri;
    for (var steamId in achievement.players) {
      if (achievement.players[steamId].isUnlocked) {
        isUnlocked = true;
        unlockedUri = achievement.players[steamId].iconUri;
      } else {
        lockedUri = achievement.players[steamId].iconUri;
      }
    }
    achievement.isUnlocked = isUnlocked;
    if (isUnlocked) {
      achievement.iconUri = unlockedUri;
    } else {
      achievement.iconUri = lockedUri;
    }
  }
}

const getInitialListOfAchievements = (achievementsBySteamID: any) => {
  var achievements = getMasterListOfAchievements(achievementsBySteamID);
  setIconUriOnAchievements(achievements);
  return achievements;
}

const AchievementsComparison = ({ initialPlayers, achievementsBySteamID }: Props) => {
  const [players, setPlayers] = useState<any[]>(getInitialHashOfPlayers(initialPlayers))
  const [achievements, setAchievements] = useState<any[]>(getInitialListOfAchievements(achievementsBySteamID))
  const [filters, setFilters] = useState<string[]>([])

  const onFilterChange = (activeFilters: string[]) => {
    setFilters(activeFilters)
  }

  const includeAchievement = (achievement: any) => {
    if (filters.length < 1) {
      return true;
    }
    var allUnlocked = true, noneUnlocked = true;
    for (var steamId in achievement.players) {
      if (achievement.players[steamId].isUnlocked) {
        noneUnlocked = false;
      } else {
        allUnlocked = false;
      }
      if (!allUnlocked && !noneUnlocked) {
        break;
      }
    }
    if (filters.indexOf('allUnlocked') > -1 && !allUnlocked) {
      return false;
    }
    if (filters.indexOf('noneUnlocked') > -1 && !noneUnlocked) {
      return false;
    }
    return true;
  }

  const haveAchievements = achievements.length > 0
  const filteredAchievements = achievements.filter(a => includeAchievement(a))

  return <div>
    {haveAchievements ? <UnlockedBarChart achievements={achievements} players={players} /> : <p>No achievements</p>}
    {haveAchievements ? <hr /> : null}
    {haveAchievements ? <Filters onChange={onFilterChange} filteredCount={filteredAchievements.length} /> : null}
    <ul>
      {filteredAchievements.map((achievement) => <AchievementComparison players={players}
        achievement={achievement} key={achievement.key} />
      )}
    </ul>
  </div>
}

export default AchievementsComparison;
