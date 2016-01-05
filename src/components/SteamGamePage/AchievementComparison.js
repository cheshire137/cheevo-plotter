import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import cx from 'classnames';

class AchievementComparison extends Component {
  render() {
    const achievement = this.props.achievement;
    const playerIds = Object.keys(achievement.players);
    const players = this.props.players;
    var liClasses = [s.achievementComparison];
    if (achievement.isUnlocked) {
      liClasses.push(s.unlocked);
    }
    return (
      <li className={liClasses.join(' ')}>
        {typeof achievement.iconUri === 'string' ? (
          <img src={achievement.iconUri} alt={achievement.name}
               className={s.achievementIcon} width="64"
               height="64" />
        ) : ''}
        <div className={s.achievementDetails}>
          <h2 className={s.achievementName} data-tt={achievement.name}>
            {achievement.name}
          </h2>
          <ul className={s.playerAchievements}>
            {playerIds.map((playerId) => {
              var player = players[playerId];
              var status = achievement.players[playerId];
              var iconClass = 'fa ' + (status.isUnlocked ? 'fa-unlock' : 'fa-lock');
              var title = status.isUnlocked ? 'Unlocked' : 'Not yet unlocked';
              return (
                <li key={playerId} className={s.playerAchievement}>
                  <i className={iconClass}></i>
                  <span className={s.playerName} data-tt={title}>
                    {player.personaname}
                  </span>
                </li>
              );
            }.bind(this))}
          </ul>
        </div>
      </li>
    );
  }
}

export default AchievementComparison;
