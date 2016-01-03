import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Link from '../Link';
import SteamApps from '../../stores/steam-apps.json';

class PlayedGamesList extends Component {
  getGameName(appId) {
    const apps = SteamApps.applist.apps;
    for (var i = 0; i < apps.length; i++) {
      var app = apps[i];
      if (app.appid === appId) {
        return app.name;
      }
    }
    return 'Steam App ' + appId;
  }

  render() {
    return (
      <ul>
        {this.props.games.map((appId) => {
          return (
            <li key={appId}>
              <Link className={s.gameLink}
                    to={'/steam/' + this.props.username + '/game/' + appId}>
                {this.getGameName(appId)}
              </Link>
            </li>
          );
        }.bind(this))}
      </ul>
    );
  }
}

export default PlayedGamesList;
