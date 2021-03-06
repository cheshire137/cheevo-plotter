import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import cx from 'classnames';

class AchievementsList extends Component {
  getUnlockedCount() {
    var count = 0;
    for (var i = 0; i < this.props.achievements.length; i++) {
      if (this.props.achievements[i].isUnlocked) {
        count++;
      }
    }
    return count;
  }

  render() {
    if (this.props.achievements.length < 1) {
      return <p>No achievements</p>;
    }
    const unlockedCount = this.getUnlockedCount();
    const percentage = Math.round((unlockedCount / this.props.achievements.length) * 100);
    return (
      <div className={s.achievements}>
        <p className={s.achievementsSummary}>
          Unlocked {unlockedCount} of {this.props.achievements.length} &mdash;
          <strong> {percentage}%</strong>
        </p>
        <ul className={cx(s.achievementsList, s.clearfix)}>
          {this.props.achievements.map((achievement) => {
            var title = achievement.isUnlocked ? 'Unlocked' : 'Not yet unlocked';
            return (
              <li key={achievement.key} className={s.achievement}>
                {typeof achievement.iconUri === 'string' ? (
                  <img src={achievement.iconUri} alt={achievement.name}
                       className={s.achievementIcon} width="64" height="64" />
                ) : ''}
                <span data-tt={title} className={s.achievementName}>
                  {achievement.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default AchievementsList;
