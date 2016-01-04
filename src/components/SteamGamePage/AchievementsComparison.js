import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import cx from 'classnames';

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
        {this.state.achievements.map((achievement) => {
          var playerIds = Object.keys(achievement.players);
          return (
            <div key={achievement.key}>
              <h2>
                {typeof achievement.iconUri === 'string' ? (
                  <img src={achievement.iconUri} alt={achievement.name}
                       className={s.achievementIcon} width="64"
                       height="64" />
                ) : ''}
                {achievement.name}
              </h2>
              <ul className={s.playerAchievements}>
                {playerIds.map((playerId) => {
                  var player = this.state.players[playerId];
                  var status = achievement.players[playerId];
                  return (
                    <li key={playerId} className={s.playerAchievement}>
                      {player.personaname} - {status.isUnlocked ? 'unlocked' : 'not yet unlocked'}
                    </li>
                  );
                }.bind(this))}
              </ul>
            </div>
          );
        }.bind(this))}
      </div>
    );
  }
}

export default AchievementsComparison;
