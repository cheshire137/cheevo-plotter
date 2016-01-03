import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import s from './SteamUserPage.scss';
import withStyles from '../../decorators/withStyles';
import _ from 'underscore';
import LocalStorage from '../../stores/localStorage';
import Steam from '../../actions/steam';
import parsePath from 'history/lib/parsePath';
import Location from '../../core/Location';

const title = 'Steam User';

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
    Steam.getSteamId(this.props.username).
          then(this.onSteamIdFetched.bind(this));
  }

  clearSteamUsername(event) {
    event.preventDefault();
    LocalStorage.delete('steam-id');
    LocalStorage.delete('steam-username');
    Location.push({
      ...(parsePath('/'))
    });
  }

  onSteamIdFetched(data) {
    LocalStorage.set('steam-id', data.response.steamid);
    this.setState({steamIdLoaded: true});
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            {title} - {this.props.username}
            <a href="#" className={s.clearSteamUsername} onClick={this.clearSteamUsername}>
              &times;
            </a>
          </h1>
          {this.state.steamIdLoaded ? '' : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    );
  }
}

export default SteamUserPage;
