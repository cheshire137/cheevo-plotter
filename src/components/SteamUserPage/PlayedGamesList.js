import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Link from '../Link';
import SteamApps from '../../stores/steamApps';

class PlayedGamesList extends Component {
  render() {
    return (
      <ul>
        {this.props.games.map((appId) => {
          return (
            <li key={appId}>
              <Link className={s.gameLink}
                    to={'/steam/' + this.props.username + '/game/' + appId}>
                {SteamApps.getName(appId)}
              </Link>
            </li>
          );
        }.bind(this))}
      </ul>
    );
  }
}

export default PlayedGamesList;
