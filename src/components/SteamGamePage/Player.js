import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import LocalStorage from '../../stores/localStorage';
import parsePath from 'history/lib/parsePath';
import Location from '../../core/Location';

class Player extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      userPagePath: '/steam/' + encodeURIComponent(props.player.personaname)
    };
  }

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

  goToSteamUserPage(event) {
    event.preventDefault();
    LocalStorage.set('steam-id', this.props.player.steamid);
    LocalStorage.delete('steam-username');
    LocalStorage.delete('steam-games');
    LocalStorage.delete('steam-selected-friends');
    Location.push({
      ...(parsePath(this.state.userPagePath))
    });
  }

  render() {
    const haveAchievements = typeof this.props.achievements === 'object' &&
        this.props.achievements.length > 0;
    return (
      <li className={s.player}>
        {this.props.isCurrent ? (
          <span className={s.playerProfileText}>
            <img src={this.props.player.avatar} className={s.playerAvatar}
                 alt={this.props.player.steamid} />
            <span className={s.playerName}>
              {this.props.player.personaname}
            </span>
          </span>
        ) : (
          <a href={this.state.userPagePath}
             onClick={this.goToSteamUserPage.bind(this)}
             className={s.playerProfileLink}
             data-tt="View games and friends">
            <img src={this.props.player.avatar} className={s.playerAvatar}
                 alt={this.props.player.steamid} />
            <span className={s.playerName}>
              {this.props.player.personaname}
            </span>
          </a>
        )}
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
