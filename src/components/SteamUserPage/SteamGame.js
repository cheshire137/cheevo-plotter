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
    return 'Steam App ' + this.props.appId;
  }

  componentDidMount() {
    Steam.getAchievements(this.props.steamId, this.props.appId).
          then(this.onAchievementsLoaded.bind(this));
  }

  onAchievementsLoaded(data) {
    const achievements = data.playerstats.achievements[0].achievement;
    console.log('achievements', achievements);
    const gameInfo = data.playerstats.game[0];
    this.setState({imageUri: gameInfo.gameIcon[0],
                   gameName: gameInfo.gameName[0]});
  }

  render() {
    return (
      <li>
        {typeof this.state.imageUri === 'string' ? (
          <img src={this.state.imageUri} alt={this.state.gameName}
               className={s.gameIcon} />
        ) : ''}
        <span className={s.gameName} title={this.props.appId}>
          {typeof this.state.gameName === 'string' ?
              this.state.gameName : this.getGameName(this.props.appId)}
        </span>
      </li>
    );
  }
}

export default SteamGame;
