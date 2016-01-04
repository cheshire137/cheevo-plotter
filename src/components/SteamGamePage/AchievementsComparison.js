import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import cx from 'classnames';

class AchievementsComparison extends Component {
  constructor(props, context) {
    super(props, context);
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
    this.state = {achievements: achievements};
  }

  render() {
    return (
      <div className={s.achievementsComparison}>
        {this.state.achievements.map((achievement) => {
          var playerIds = Object.keys(achievement.players);
          return (
            <div key={achievement.key}>
              <h2>{achievement.name}</h2>
              <ul>
                {playerIds.map((playerId) => {
                  var status = achievement.players[playerId];
                  return (
                    <li key={playerId}>
                      {typeof status.iconUri === 'string' ? (
                        <img src={status.iconUri} alt={achievement.name}
                             className={s.achievementIcon} width="64"
                             height="64" />
                      ) : ''}
                      {playerId}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }.bind(this))}
      </div>
    );
  }
}

export default AchievementsComparison;
