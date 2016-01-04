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
    this.state = {ownedGames: {}};
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
      var ownedGames = this.state.ownedGames;
      ownedGames[steamId] = games;
      this.setState({ownedGames: ownedGames});
      this.updateSharedGames();
      return;
    }
    Steam.getOwnedGames(steamId).then(this.onGamesFetched.bind(this, steamId));
  }

  organizeGamesResponse(data) {
    var games = data.response.games;
    var playedGames = [];
    for (var i = 0; i < games.length; i++) {
      var game = games[i];
      if (game.playtime_forever > 0) {
        playedGames.push(game.appid);
      }
    }
    return SteamApps.sortIds(playedGames);
  }

  onGamesFetched(steamId, data) {
    const playedGames = this.organizeGamesResponse(data);
    LocalStorage.set('steam-games', playedGames);
    var ownedGames = this.state.ownedGames;
    ownedGames[steamId] = playedGames;
    this.setState({ownedGames: ownedGames});
    this.updateSharedGames();
  }

  updateSharedGames(gamesBySteamId) {
    gamesBySteamId = gamesBySteamId || this.state.ownedGames;
    var ownedGames = [];
    for (var steamId in gamesBySteamId) {
      ownedGames.push(this.state.ownedGames[steamId]);
    }
    ownedGames.sort((a, b) => {
      return a.length - b.length;
    });
    var sharedGames;
    if (ownedGames.length < 2) {
      sharedGames = ownedGames[0];
    } else {
      sharedGames = ownedGames.shift().filter((v) => {
        return ownedGames.every((a) => {
          return a.indexOf(v) > -1;
        });
      });
    }
    this.setState({games: sharedGames});
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

  onFriendSelectionChanged(selectedFriends) {
    console.log('now selected', selectedFriends);
    var ownedGames = this.state.ownedGames;
    if (typeof this.state.steamId !== 'undefined') {
      for (var steamId in ownedGames) {
        if (selectedFriends.indexOf(steamId) < 0 &&
            steamId !== this.state.steamId) {
          delete ownedGames[steamId];
        }
      }
      this.updateSharedGames(ownedGames);
      this.setState({ownedGames: ownedGames});
    }
    const knownFriends = Object.keys(ownedGames);
    for (var i = 0; i < selectedFriends.length; i++) {
      var steamId = selectedFriends[i];
      if (knownFriends.indexOf(steamId) < 0) {
        console.log('looking up games for', steamId);
        Steam.getOwnedGames(steamId).
              then(this.onFriendGamesFetched.bind(this, steamId));
      }
    }
  }

  onFriendGamesFetched(steamId, data) {
    var ownedGames = this.state.ownedGames;
    const friendGames = this.organizeGamesResponse(data);
    ownedGames[steamId] = friendGames;
    this.setState({ownedGames: ownedGames});
    this.updateSharedGames();
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
            <FriendsList username={this.props.username}
                         friends={this.state.friends}
                         onSelectionChange={this.onFriendSelectionChanged.bind(this)} />
          ) : ''}
          {typeof this.state.steamId === 'undefined' ? (
            <p>Loading...</p>
          ) : typeof this.state.games === 'object' ? (
            <PlayedGamesList steamId={this.state.steamId}
                             games={this.state.games}
                             username={this.props.username} />
          ) : (
            <p>Loading games list...</p>
          )}
        </div>
      </div>
    );
  }
}

export default SteamUserPage;
