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
    const achievements = data.achievements;
    console.log('achievements', achievements);
    this.setState({imageUri: data.iconUri});
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
            {typeof this.state.imageUri === 'string' ? (
              <img src={this.state.imageUri} alt={this.state.gameName}
                   className={s.gameIcon} />
            ) : ''}
            {title}: {this.state.gameName}
          </h1>
        </div>
      </div>
    );
  }
}

export default SteamGamePage;
