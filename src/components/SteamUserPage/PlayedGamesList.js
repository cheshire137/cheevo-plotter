import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import SteamApps from '../../stores/steam-apps.json';

class PlayedGamesList extends Component {
  getGameName(appid) {
    const apps = SteamApps.applist.apps;
    for (var i = 0; i < apps.length; i++) {
      var app = apps[i];
      if (app.appid === appid) {
        return app.name;
      }
    }
  }

  render() {
    return (
      <ul>
        {this.props.games.map((appid) => {
          return (
            <li>{this.getGameName(appid)}</li>
          );
        })}
      </ul>
    );
  }
}

export default PlayedGamesList;
