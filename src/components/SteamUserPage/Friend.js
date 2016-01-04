import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';

class Friend extends Component {
  render() {
    return (
      <li className={s.friend}>
        <a href={this.props.friend.profileurl} target="_blank">
          <img src={this.props.friend.avatar} alt={this.props.friend.steamid} />
          <span className={s.friendName}>{this.props.friend.personaname}</span>
        </a>
      </li>
    );
  }
}

export default Friend;
