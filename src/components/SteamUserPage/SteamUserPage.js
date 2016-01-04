import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import withStyles from '../../decorators/withStyles';
import _ from 'underscore';
import LocalStorage from '../../stores/localStorage';
import Steam from '../../actions/steam';
import parsePath from 'history/lib/parsePath';
import Location from '../../core/Location';
import Link from '../Link';
import PlayedGamesList from './PlayedGamesList';
import SteamApps from '../../stores/steamApps';
import FriendsList from './FriendsList';

@withStyles(s)
class SteamUserPage extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentWillMount() {
    this.context.onSetTitle('Steam / ' + this.props.username);
    LocalStorage.set('steam-username', this.props.username);
  }

  componentDidMount() {
    var steamId = LocalStorage.get('steam-id');
    if (typeof steamId === 'undefined') {
      this.fetchSteamId();
      return;
    }
    this.fetchFriends(steamId);
    this.fetchGames(steamId);
    this.setState({steamId: steamId});
  }

  fetchSteamId() {
    Steam.getSteamId(this.props.username).
          then(this.onSteamIdFetched.bind(this));
  }

  onSteamIdFetched(data) {
    var steamId = data.response.steamid;
    LocalStorage.set('steam-id', steamId);
    this.fetchFriends(steamId);
    this.fetchGames(steamId);
    this.setState({steamId: steamId});
  }

  fetchFriends(steamId) {
    Steam.getFriends(steamId).then(this.onFriendIdsFetched.bind(this));
  }

  onFriendIdsFetched(data) {
    const friendIds = data.friendslist.friends.map((f) => f.steamid);
    Steam.getPlayerSummaries(friendIds).
          then(this.onFriendSummariesFetched.bind(this));
  }

  onFriendSummariesFetched(friends) {
    this.setState({friends: friends});
  }

  fetchGames(steamId) {
    var games = LocalStorage.get('steam-games');
    if (typeof games === 'object') {
      this.setState({games: games});
      return;
    }
    Steam.getOwnedGames(steamId).
          then(this.onGamesFetched.bind(this));
  }

  onGamesFetched(data) {
    var games = data.response.games;
    var playedGames = [];
    for (var i = 0; i < games.length; i++) {
      var game = games[i];
      if (game.playtime_forever > 0) {
        playedGames.push(game.appid);
      }
    }
    LocalStorage.set('steam-games', SteamApps.sortIds(playedGames));
    this.setState({games: playedGames});
  }

  clearSteamUsername(event) {
    event.preventDefault();
    LocalStorage.delete('steam-id');
    LocalStorage.delete('steam-username');
    LocalStorage.delete('steam-games');
    Location.push({
      ...(parsePath('/'))
    });
  }

  render() {
    const profileUrl = 'https://steamcommunity.com/id/' +
                       this.props.username + '/';
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            <Link to="/" className={s.clearSteamUsername}
                  onClick={this.clearSteamUsername}>
              &laquo;
            </Link>
            Steam /
            <a href={profileUrl} target="_blank"> {this.props.username}</a>
          </h1>
          {typeof this.state.friends === 'object' ? (
            <FriendsList friends={this.state.friends} />
          ) : ''}
          {typeof this.state.steamId === 'undefined' ? (
            <p>Loading...</p>
          ) : typeof this.state.games === 'object' ? (
            <div className={s.loadedGames}>
              <p>
                <strong>{this.props.username} </strong>
                has played <strong>{this.state.games.length} </strong>
                {this.state.games.length === 1 ? 'game' : 'games'}.
              </p>
              <PlayedGamesList steamId={this.state.steamId}
                               games={this.state.games}
                               username={this.props.username} />
            </div>
          ) : (
            <p>Loading games list...</p>
          )}
        </div>
      </div>
    );
  }
}

export default SteamUserPage;
