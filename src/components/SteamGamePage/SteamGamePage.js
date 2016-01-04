import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import withStyles from '../../decorators/withStyles';
import _ from 'underscore';
import LocalStorage from '../../stores/localStorage';
import Steam from '../../actions/steam';
import parsePath from 'history/lib/parsePath';
import Location from '../../core/Location';
import Link from '../Link';
import SteamApps from '../../stores/steamApps';
import AchievementsList from './AchievementsList';

@withStyles(s)
class SteamGamePage extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentDidMount() {
    const steamId = LocalStorage.get('steam-id');
    const name = SteamApps.getName(this.props.appId);
    this.context.onSetTitle('Steam / ' + this.props.username + ' / ' + name);
    this.setState({gameName: name, steamId: steamId});
    Steam.getAchievements(steamId, this.props.appId).
          then(this.onAchievementsLoaded.bind(this));
  }

  onAchievementsLoaded(data) {
    console.log('data', data);
    this.setState({iconUri: data.iconUri,
                   achievements: data.achievements});
  }

  prettyTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +
           date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
  }

  render() {
    const gameUrl = 'https://steamcommunity.com/app/' + this.props.appId;
    const profileUrl = 'https://steamcommunity.com/id/' +
                       this.props.username + '/';
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            <Link to={'/steam/' + this.props.username}
                  className={s.clearSteamGame}>
              &laquo;
            </Link>
            {typeof this.state.iconUri === 'string' ? (
              <img src={this.state.iconUri} alt={this.state.gameName}
                   className={s.gameIcon} />
            ) : ''}
            Steam /
            <a href={profileUrl} target="_blank"> {this.props.username} </a>
            /
            <a href={gameUrl} target="_blank"> {this.state.gameName}</a>
          </h1>
          {typeof this.state.achievements === 'object' ? (
            <AchievementsList achievements={this.state.achievements} />
          ) : (
            <span>Loading achievements...</span>
          )}
        </div>
      </div>
    );
  }
}

export default SteamGamePage;
