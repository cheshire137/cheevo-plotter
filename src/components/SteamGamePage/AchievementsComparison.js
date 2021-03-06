import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import AchievementComparison from './AchievementComparison';
import UnlockedBarChart from './UnlockedBarChart';
import Filters from './Filters';

class AchievementsComparison extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {achievements: this.getInitialListOfAchievements(props),
                  players: this.getInitialHashOfPlayers(props)};
  }

  getInitialHashOfPlayers(props) {
    var players = {};
    for (var i = 0; i < props.players.length; i++) {
      var player = props.players[i];
      players[player.steamid] = player;
    }
    return players;
  }

  getInitialListOfAchievements(props) {
    var achievements = this.getMasterListOfAchievements(props);
    this.setIconUriOnAchievements(achievements);
    return achievements;
  }

  getMasterListOfAchievements(props) {
    var achievements = [];
    for (var steamId in props.achievementsBySteamId) {
      for (var i = 0; i < props.achievementsBySteamId[steamId].length; i++) {
        var achievement = props.achievementsBySteamId[steamId][i];
        var inList = false;
        for (var j = 0; j < achievements.length; j++) {
          if (achievements[j].key === achievement.key) {
            inList = true;
            achievements[j].players[steamId] = {
              isUnlocked: achievement.isUnlocked,
              iconUri: achievement.iconUri
            }
            break;
          }
        }
        if (!inList) {
          var players = {};
          players[steamId] = {
            isUnlocked: achievement.isUnlocked,
            iconUri: achievement.iconUri
          }
          achievements.push({
            key: achievement.key,
            name: achievement.name,
            players: players
          });
        }
      }
    }
    return achievements;
  }

  setIconUriOnAchievements(achievements) {
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

  onFilterChange(activeFilters) {
    this.setState({filters: activeFilters});
  }

  includeAchievement(achievement) {
    const filters = this.state.filters;
    if (typeof filters === 'undefined') {
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

  render() {
    const haveAchievements = this.state.achievements.length > 0;
    const filteredAchievements = this.state.achievements.
        filter(this.includeAchievement.bind(this));
    return (
      <div className={s.achievementsComparison}>
        {haveAchievements ? (
          <UnlockedBarChart achievements={this.state.achievements}
                            players={this.state.players} />
        ) : (
          <p>No achievements</p>
        )}
        {haveAchievements ? <hr /> : ''}
        {haveAchievements ? (
          <Filters onChange={this.onFilterChange.bind(this)}
                   filteredCount={filteredAchievements.length} />
        ) : ''}
        <ul className={s.achievementsList}>
          {filteredAchievements.map((achievement) => {
            return <AchievementComparison players={this.state.players}
                                          achievement={achievement}
                                          key={achievement.key} />;
          }.bind(this))}
        </ul>
      </div>
    );
  }
}

export default AchievementsComparison;
