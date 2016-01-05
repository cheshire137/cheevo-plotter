import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';

class Player extends Component {
  getUnlockPercentageText() {
    if (typeof this.props.achievements !== 'object') {
      return '--';
    }
    var unlockCount = 0;
    const total = this.props.achievements.length;
    for (var i = 0; i < total; i++) {
      if (this.props.achievements[i].isUnlocked) {
        unlockCount++;
      }
    }
    return Math.round((unlockCount / total) * 100) + '%';
  }

  render() {
    const haveAchievements = typeof this.props.achievements === 'object' &&
        this.props.achievements.length > 0;
    return (
      <li className={s.player}>
        <a href={this.props.player.profileurl} target="_blank"
           className={s.playerProfileLink}>
          <img src={this.props.player.avatar} className={s.playerAvatar}
               alt={this.props.player.steamid} />
          <span className={s.playerName}>
            {this.props.player.personaname}
          </span>
        </a>
        {haveAchievements ? (
          <span className={s.unlockPct}>
            <span data-tt="% unlocked">{this.getUnlockPercentageText()}</span>
          </span>
        ) : ''}
      </li>
    );
  }
}

export default Player;
