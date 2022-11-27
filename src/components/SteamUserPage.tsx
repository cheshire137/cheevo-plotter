import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import withStyles from '../../decorators/withStyles';
import _ from 'underscore';
import LocalStorage from '../../models/localStorage';
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
          then(this.onFriendIdsFetched.bind(this, steamId)).
          then(undefined, this.onFriendIdsError.bind(this));
  }

  onFriendIdsFetched(steamId, data) {
    const friendIds = data.friendslist.friends.map((f) => f.steamid).
        concat([steamId]);
    Steam.getPlayerSummaries(friendIds).
          then(this.onFriendSummariesFetched.bind(this, steamId)).
          then(undefined, this.onFriendSummariesError.bind(this));
  }

  onFriendIdsError(err) {
    console.error('failed to fetch Steam friends', err);
    this.setState({friendsError: true});
  }

  getUsernameFromProfileUrl(profileUrl) {
    const needle = '/id/';
    const index = profileUrl.toLowerCase().indexOf(needle);
    if (index > -1) {
      return profileUrl.slice(index + needle.length).replace(/\/+$/, '');
    }
  }

  onFriendSummariesFetched(steamId, summaries) {
    // See https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
    // communityvisibilitystate 3 means the profile is public.
    // Need public profiles to see owned/played games for comparison.
    const publicFriends = summaries.
        filter((p) => {
          return p.communityvisibilitystate === 3 && p.steamid !== steamId;
        });
    const playerSummary = summaries.filter((p) => p.steamid === steamId)[0];
    playerSummary.username =
        this.getUsernameFromProfileUrl(playerSummary.profileurl) ||
        this.props.username;
    this.setState({friends: publicFriends, friendsError: false,
                   playerSummary: playerSummary});
    if (playerSummary.username !== this.props.username) {
      const path = '/steam/' + encodeURIComponent(playerSummary.username);
      Location.push({
        ...(parsePath(path))
      });
    }
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
          then(undefined, this.onGamesError.bind(this, steamId));
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
    this.setState({ownedGames: ownedGames, gamesError: false});
    this.updateSharedGames();
  }

  onGamesError(steamId, err) {
    console.error('failed to fetch Steam games for ' + steamId, err);
    this.setState({gamesError: true});
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
    const haveSteamId = typeof this.state.steamId !== 'undefined';
    const haveGamesList = typeof this.state.games === 'object';
    const haveFriendsList = typeof this.state.friends === 'object';
    const haveSteamIdError = typeof this.state.steamIdError === 'boolean' &&
        this.state.steamIdError;
    const haveFriendsError = typeof this.state.friendsError === 'boolean' &&
        this.state.friendsError;
    const haveGamesError = typeof this.state.gamesError === 'boolean' &&
        this.state.gamesError;
    const havePlayerSummary = typeof this.state.playerSummary === 'object';
    const haveRealName = havePlayerSummary &&
        typeof this.state.playerSummary.realname === 'string' &&
        this.state.playerSummary.realname.length > 0;
    const profileUrl = havePlayerSummary ?
        this.state.playerSummary.profileurl :
        'https://steamcommunity.com/id/' +
        encodeURIComponent(this.props.username) + '/';
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            <Link to="/" className={s.clearSteamUsername}
                  onClick={this.clearSteamUsername}>
              &laquo;
            </Link>
            Steam
            <span className={s.spacer}> / </span>
            {havePlayerSummary ? (
              <a href={profileUrl} target="_blank"
                 data-tt="View Steam Community profile">
                <img src={this.state.playerSummary.avatarmedium}
                     className={s.playerAvatar}
                     alt={this.state.playerSummary.steamid} />
                <span className={s.playerUsername}> {this.state.playerSummary.personaname} </span>
                {haveRealName ? (
                  <span className={s.playerRealName}>
                    {this.state.playerSummary.realname}
                  </span>
                ) : ''}
              </a>
            ) : (
              <a href={profileUrl} target="_blank"
                 data-tt="View Steam Community profile">
                {this.props.username}
              </a>
            )}
          </h1>
          {haveSteamIdError ? (
            <div className={s.steamIdErrorWrapper}>
              <p className={[s.alert, s.alertError].join(' ')}>
                Could not find Steam ID for that username.
              </p>
              <p className={s.instructions}>
                Try setting your custom URL in Steam:
              </p>
              <p className={s.steamProfileWrapper}>
                <img src={require('./steam-edit-profile.jpg')} width="640"
                     height="321" alt="Edit Steam profile" />
              </p>
              <p className={s.instructions}>
                Then, search here for the name you set in that custom URL.
              </p>
            </div>
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
          ) : haveSteamId ? haveFriendsError ? (
            <p>There was an error loading the friends list.</p>
          ) : <p>Loading friends list...</p> : ''}
          {haveFriendsList && haveGamesList ? <hr /> : ''}
          {haveSteamId ? haveGamesList ? (
            <PlayedGamesList steamId={this.state.steamId}
                             games={this.state.games}
                             username={this.props.username} />
          ) : haveGamesError ? (
            <p>
              There was an error loading the list of games
              <strong> {this.props.username} </strong>
              owns.
            </p>
          ) : (
            <p>Loading games list...</p>
          ) : haveSteamIdError ? '' : <p>Loading...</p>}
        </div>
      </div>
    );
  }
}

export default SteamUserPage;
