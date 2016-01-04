import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Link from '../Link';
import SteamApps from '../../stores/steamApps';

class SteamGame extends Component {
  render() {
    const url = '/steam/' + this.props.username + '/game/' + this.props.appId;
    return (
      <li className={s.steamGameListItem}>
        <Link className={s.gameLink} to={url}>
          {SteamApps.getName(this.props.appId)}
        </Link>
      </li>
    );
  }
}

export default SteamGame;
