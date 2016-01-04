import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';

class Friend extends Component {
  render() {
    const domId = 'friend-' + this.props.friend.steamid;
    return (
      <li className={s.friend}>
        <label htmlFor={domId}>
          <input type="checkbox" id={domId} />
          <img src={this.props.friend.avatar}
               className={s.friendAvatar}
               alt={this.props.friend.steamid} />
          <span className={s.friendName}>{this.props.friend.personaname}</span>
        </label>
        <a href={this.props.friend.profileurl} className={s.friendLink}
           target="_blank" data-tt="View profile">
          <i className="fa fa-external-link"></i>
        </a>
      </li>
    );
  }
}

export default Friend;
