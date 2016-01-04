import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import withStyles from '../../decorators/withStyles';
import _ from 'underscore';
import LocalStorage from '../../stores/localStorage';
import Steam from '../../actions/steam';
import Link from '../Link';
import SteamApps from '../../stores/steamApps';
import AchievementsList from './AchievementsList';
import AchievementsComparison from './AchievementsComparison';
import PlayersList from './PlayersList';

@withStyles(s)
class SteamGamePage extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    const selectedIds = LocalStorage.get('steam-selected-friends') || [
      LocalStorage.get('steam-id')
    ];
    this.state = {selectedIds: selectedIds};
  }

  componentDidMount() {
    const name = SteamApps.getName(this.props.appId);
    this.context.onSetTitle('Steam / ' + this.props.username + ' / ' + name);
    this.setState({gameName: name, steamId: LocalStorage.get('steam-id')});
    for (var i = 0; i < this.state.selectedIds.length; i++) {
      var steamId = this.state.selectedIds[i];
      Steam.getAchievements(steamId, this.props.appId).
            then(this.onAchievementsLoaded.bind(this, steamId));
    }
    Steam.getPlayerSummaries(this.state.selectedIds).
          then(this.onPlayerSummariesFetched.bind(this));
  }

  onPlayerSummariesFetched(players) {
    this.setState({players: players});
  }

  onAchievementsLoaded(steamId, data) {
    var achievements = this.state.achievements || {};
    achievements[steamId] = data.achievements;
    this.setState({iconUri: data.iconUri, achievements: achievements});
  }

  render() {
    const gameUrl = 'https://steamcommunity.com/app/' + this.props.appId;
    const profileUrl = 'https://steamcommunity.com/id/' +
                       this.props.username + '/';
    const onlyOneUser = this.state.selectedIds.length === 1;
    const haveAchievements = typeof this.state.achievements === 'object';
    const havePlayers = typeof this.state.players === 'object';
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
          {havePlayers ? (
            <PlayersList players={this.state.players} />
          ) : (
            <p>Loading player data...</p>
          )}
          {haveAchievements ? onlyOneUser ? (
            <AchievementsList
                achievements={this.state.achievements[this.state.steamId]} />
          ) : (
            <AchievementsComparison achievements={this.state.achievements} />
          ) : (
            <p>Loading achievements...</p>
          )}
        </div>
      </div>
    );
  }
}

export default SteamGamePage;
