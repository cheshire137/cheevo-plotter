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
import parsePath from 'history/lib/parsePath';
import Location from '../../core/Location';

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
    var playerSteamId = LocalStorage.get('steam-id');
    if (typeof playerSteamId === 'undefined') {
      LocalStorage.delete('steam-games');
      LocalStorage.delete('steam-selected-friends');
      const path = '/steam/' + encodeURIComponent(this.props.username);
      Location.push({
        ...(parsePath(path))
      });
      return;
    }
    const name = SteamApps.getName(this.props.appId);
    this.context.onSetTitle('Steam / ' + this.props.username + ' / ' + name);
    this.setState({gameName: name, steamId: playerSteamId});
    for (var i = 0; i < this.state.selectedIds.length; i++) {
      var steamId = this.state.selectedIds[i];
      Steam.getAchievements(steamId, this.props.appId).
            then(this.onAchievementsLoaded.bind(this, steamId)).
            then(undefined, this.onAchievementsError.bind(this, steamId));
    }
    Steam.getPlayerSummaries(this.state.selectedIds).
          then(this.onPlayerSummariesFetched.bind(this)).
          then(undefined, this.onPlayerSummariesError.bind(this));
  }

  onPlayerSummariesFetched(players) {
    this.setState({players: players});
  }

  onPlayerSummariesError(err) {
    console.error('failed to load player summaries', err);
  }

  onAchievementsLoaded(steamId, data) {
    var achievements = this.state.achievements || {};
    var loadCount = this.state.achievementLoadCount;
    if (typeof loadCount === 'undefined') {
      loadCount = 0;
    }
    loadCount++;
    achievements[steamId] = data.achievements;
    this.setState({iconUri: data.iconUri, achievements: achievements,
                   achievementLoadCount: loadCount});
  }

  onAchievementsError(steamId, err) {
    console.error('failed to load achievements list for ' + steamId, err);
    var achievements = this.state.achievements || {};
    var loadCount = this.state.achievementLoadCount;
    if (typeof loadCount === 'undefined') {
      loadCount = 0;
    }
    loadCount++;
    achievements[steamId] = [];
    this.setState({achievements: achievements,
                   achievementLoadCount: loadCount});
  }

  render() {
    const gameUrl = 'https://steamcommunity.com/app/' + this.props.appId;
    const profileUrl = 'https://steamcommunity.com/id/' +
                       this.props.username + '/';
    const onlyOneUser = this.state.selectedIds.length === 1;
    const haveAchievements = typeof this.state.achievements === 'object' &&
        this.state.achievementLoadCount === this.state.selectedIds.length;
    const havePlayers = typeof this.state.players === 'object';
    const achievementCount = haveAchievements ?
        this.state.achievements[this.state.steamId].length : 0;
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
            {haveAchievements && achievementCount > 0 ? (
              <span className={s.achievementCount}>
                <span className={s.count}>{achievementCount}</span>
                <span className={s.units}>
                  {achievementCount === 1 ? 'achievement' : 'achievements'}
                </span>
              </span>
            ) : ''}
          </h1>
          {havePlayers ? onlyOneUser ? '' : (
            <PlayersList players={this.state.players}
                         currentSteamId={this.state.steamId}
                         achievements={this.state.achievements} />
          ) : (
            <p>Loading player data...</p>
          )}
          {haveAchievements ? onlyOneUser ? (
            <AchievementsList
                achievements={this.state.achievements[this.state.steamId]} />
          ) : havePlayers ? (
            <AchievementsComparison players={this.state.players}
                steamId={this.state.steamId}
                achievementsBySteamId={this.state.achievements} />
          ) : '' : (
            <p>Loading achievements...</p>
          )}
        </div>
      </div>
    );
  }
}

export default SteamGamePage;
