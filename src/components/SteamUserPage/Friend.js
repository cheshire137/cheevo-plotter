import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';

class Friend extends Component {
  onToggle(event) {
    this.props.onToggle(this.props.friend.steamid, event.target.checked);
  }

  render() {
    const domId = 'friend-' + this.props.friend.steamid;
    return (
      <li className={s.friend}>
        <input checked={this.props.isSelected} type="checkbox" id={domId}
               onChange={this.onToggle.bind(this)}
               className={s.friendToggle} />
        <label className={s.label} htmlFor={domId}>
          <img src={this.props.friend.avatar}
               className={s.friendAvatar}
               alt={this.props.friend.steamid} />
          <span className={s.friendName}>{this.props.friend.personaname}</span>
        </label>
      </li>
    );
  }
}

export default Friend;
