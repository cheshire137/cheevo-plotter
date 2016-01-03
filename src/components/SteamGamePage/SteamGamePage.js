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

const title = 'Steam Game';

@withStyles(s)
class SteamGamePage extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  componentDidMount() {
    const steamId = LocalStorage.get('steam-id');
    this.setState({gameName: SteamApps.getName(this.props.appId),
                   steamId: steamId});
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
            {title}: {this.state.gameName}
          </h1>
          {typeof this.state.achievements === 'object' ? (
            <ul className={s.achievementsList}>
              {this.state.achievements.map((achievement) => {
                return (
                  <li key={achievement.key}>
                    {typeof achievement.iconUri === 'string' ? (
                      <img src={achievement.iconUri} alt={achievement.name}
                           className={s.achievementIcon} />
                    ) : ''}
                    {achievement.name} -
                    {achievement.isUnlocked ? '' : (
                      <span> Not yet unlocked</span>
                    )}
                  </li>
                );
              }.bind(this))}
            </ul>
          ) : (
            <span>Loading achievements...</span>
          )}
        </div>
      </div>
    );
  }
}

export default SteamGamePage;
