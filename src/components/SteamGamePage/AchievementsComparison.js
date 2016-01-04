import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import AchievementComparison from './AchievementComparison';
import UnlockedBarChart from './UnlockedBarChart';

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
      if (isUnlocked) {
        achievement.iconUri = unlockedUri;
      } else {
        achievement.iconUri = lockedUri;
      }
    }
  }

  render() {
    return (
      <div className={s.achievementsComparison}>
        <UnlockedBarChart achievements={this.state.achievements}
                          players={this.state.players} />
        <ul className={s.achievementsList}>
          {this.state.achievements.map((achievement) => {
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
