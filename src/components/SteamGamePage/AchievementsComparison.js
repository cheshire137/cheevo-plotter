import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import cx from 'classnames';

class AchievementsComparison extends Component {
  render() {
    const steamIds = Object.keys(this.props.achievements);
    return (
      <div className={s.achievementsComparison}>
        {steamIds.map((steamId) => {
          const achievements = this.props.achievements[steamId];
          return (
            <p>{steamId}</p>
          );
        }.bind(this))}
      </div>
    );
  }
}

export default AchievementsComparison;
