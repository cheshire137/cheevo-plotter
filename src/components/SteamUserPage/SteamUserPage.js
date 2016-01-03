import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import s from './SteamUserPage.scss';
import withStyles from '../../decorators/withStyles';
import _ from 'underscore';
import LocalStorage from '../../stores/localStorage';
import Steam from '../../actions/steam';
import parsePath from 'history/lib/parsePath';
import Location from '../../core/Location';
import Link from '../Link';

const title = 'Steam Achievements';

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
    this.context.onSetTitle(title);
    LocalStorage.set('steam-username', this.props.username);
  }

  componentDidMount() {
    var steamId = LocalStorage.get('steam-id');
    if (typeof steamId === 'undefined') {
      this.fetchSteamId();
      return;
    }
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
    this.fetchGames(steamId);
    this.setState({steamId: steamId});
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
    LocalStorage.set('steam-games', playedGames);
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
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            <Link to="/" className={s.clearSteamUsername}
                  onClick={this.clearSteamUsername}>
              &laquo;
            </Link>
            {title}
          </h1>
          {typeof this.state.steamId === 'undefined' ? (
            <p>Loading...</p>
          ) : typeof this.state.games === 'object' ? (
            <p>
              <strong>{this.props.username} </strong>
              has played <strong>{this.state.games.length} </strong>
              {this.state.games.length === 1 ? 'game' : 'games'}.
            </p>
          ) : (
            <p>Loading games list...</p>
          )}
        </div>
      </div>
    );
  }
}

export default SteamUserPage;
