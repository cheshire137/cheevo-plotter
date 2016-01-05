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
    var ownedGames = {};
    var selectedFriends = LocalStorage.get('steam-selected-friends');
    if (typeof selectedFriends === 'object') {
      for (var i = 0; i < selectedFriends.length; i++) {
        ownedGames[selectedFriends[i]] = [];
      }
    }
    this.state = {ownedGames: ownedGames};
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
    this.fetchStoredFriendGames();
    this.setState({steamId: steamId});
  }

  fetchStoredFriendGames() {
    const friendIds = LocalStorage.get('steam-selected-friends');
    if (typeof friendIds !== 'object') {
      return;
    }
    this.fetchFriendGames(friendIds);
  }

  fetchSteamId() {
    Steam.getSteamId(this.props.username).
          then(this.onSteamIdFetched.bind(this)).
          then(undefined, this.onSteamIdError.bind(this));
  }

  onSteamIdFetched(data) {
    var steamId = data.response.steamid;
    LocalStorage.set('steam-id', steamId);
    this.fetchFriends(steamId);
    this.fetchGames(steamId);
    this.setState({steamId: steamId, steamIdError: false});
  }

  onSteamIdError(err) {
    console.error('failed to fetch Steam ID from username', err);
    this.setState({steamIdError: true});
  }

  fetchFriends(steamId) {
    Steam.getFriends(steamId).
          then(this.onFriendIdsFetched.bind(this)).
          then(undefined, this.onFriendIdsError.bind(this));
  }

  onFriendIdsFetched(data) {
    const friendIds = data.friendslist.friends.map((f) => f.steamid);
    Steam.getPlayerSummaries(friendIds).
          then(this.onFriendSummariesFetched.bind(this)).
          then(undefined, this.onFriendSummariesError.bind(this));
  }

  onFriendIdsError(err) {
    console.error('failed to fetch Steam friends', err);
  }

  onFriendSummariesFetched(allFriends) {
    // See https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
    // communityvisibilitystate 3 means the profile is public.
    // Need public profiles to see owned/played games for comparison.
    const publicFriends = allFriends.
        filter((f) => f.communityvisibilitystate === 3);
    this.setState({friends: publicFriends});
  }

  onFriendSummariesError(err) {
    console.error('failed to fetch friend summaries', err);
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
    Steam.getOwnedGames(steamId).
          then(this.onGamesFetched.bind(this, steamId)).
          then(this.onGamesError.bind(this, steamId));
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

  onGamesError(steamId, err) {
    console.error('failed to fetch Steam games for ' + steamId, err);
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
    LocalStorage.delete('steam-selected-friends');
    Location.push({
      ...(parsePath('/'))
    });
  }

  onFriendSelectionChanged(selectedFriends) {
    LocalStorage.set('steam-selected-friends', selectedFriends);
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
    this.fetchFriendGames(selectedFriends, ownedGames);
  }

  fetchFriendGames(selectedFriends, ownedGames) {
    ownedGames = ownedGames || this.state.ownedGames;
    const knownFriends = [];
    for (var steamId in ownedGames) {
      if (ownedGames[steamId].length > 0) {
        knownFriends.push(steamId);
      }
    }
    for (var i = 0; i < selectedFriends.length; i++) {
      var steamId = selectedFriends[i];
      if (knownFriends.indexOf(steamId) < 0) {
        Steam.getOwnedGames(steamId).
              then(this.onFriendGamesFetched.bind(this, steamId)).
              then(undefined, this.onFriendGamesError.bind(this, steamId));
      }
    }
  }

  onFriendGamesFetched(steamId, data) {
    var ownedGames = this.state.ownedGames;
    ownedGames[steamId] = this.organizeGamesResponse(data);
    this.setState({ownedGames: ownedGames});
    this.updateSharedGames();
  }

  onFriendGamesError(steamId, err) {
    console.error('failed to fetch Steam games for friend ' + steamId, err);
    var ownedGames = this.state.ownedGames;
    delete ownedGames[steamId];
    this.setState({ownedGames: ownedGames});
    this.updateSharedGames();
  }

  render() {
    const selectedSteamIds = Object.keys(this.state.ownedGames);
    const profileUrl = 'https://steamcommunity.com/id/' +
                       this.props.username + '/';
    const haveSteamId = typeof this.state.steamId !== 'undefined';
    const haveGamesList = typeof this.state.games === 'object';
    const haveFriendsList = typeof this.state.friends === 'object';
    const haveSteamIdError = typeof this.state.steamIdError === 'boolean' &&
        this.state.steamIdError;
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
          {haveSteamIdError ? (
            <p className={s.steamIdError}>
              Could not find Steam ID for that username.
            </p>
          ) : ''}
          {haveSteamId && haveFriendsList && haveGamesList ? (
            <p>
              Choose some other players and a game to compare your achievements!
            </p>
          ) : ''}
          {haveSteamId && haveFriendsList ? (
            <FriendsList selectedIds={selectedSteamIds}
                         username={this.props.username}
                         friends={this.state.friends}
                         onSelectionChange={this.onFriendSelectionChanged.bind(this)} />
          ) : haveSteamId ? <p>Loading friends list...</p> : ''}
          {haveFriendsList && haveGamesList ? <hr /> : ''}
          {haveSteamId ? haveGamesList ? (
            <PlayedGamesList steamId={this.state.steamId}
                             games={this.state.games}
                             username={this.props.username} />
          ) : (
            <p>Loading games list...</p>
          ) : haveSteamIdError ? '' : <p>Loading...</p>}
        </div>
      </div>
    );
  }
}

export default SteamUserPage;
