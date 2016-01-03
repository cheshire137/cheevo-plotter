import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Steam from '../../actions/steam';
import SteamApps from '../../stores/steam-apps.json';

class SteamGame extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  getGameName() {
    const apps = SteamApps.applist.apps;
    for (var i = 0; i < apps.length; i++) {
      var app = apps[i];
      if (app.appid === this.props.appId) {
        return app.name;
      }
    }
    return this.props.appId;
  }

  componentDidMount() {
    Steam.getAchievements(this.props.steamId, this.props.appId).
          then(this.onAchievementsLoaded.bind(this));
  }

  onAchievementsLoaded(data) {
    console.log(this.props.appId, data);
  }

  render() {
    return (
      <li>
        {this.getGameName(this.props.appId)} - {this.props.appid}
      </li>
    );
  }
}

export default SteamGame;
