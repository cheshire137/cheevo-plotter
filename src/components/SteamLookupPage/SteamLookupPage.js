import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import s from './SteamLookupPage.scss';
import withStyles from '../../decorators/withStyles';
import _ from 'underscore';
import LocalStorage from '../../stores/localStorage';
import Steam from '../../actions/steam';

const title = 'Find Steam User';

@withStyles(s)
class SteamLookupPage extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.onInputChange = _.debounce(this.onInputChange.bind(this), 2000);
  }

  onFormSubmit(event) {
    event.preventDefault();
    var username = ReactDOM.findDOMNode(this.refs.username).value;
    if (typeof username === 'string') {
      username = username.trim();
    }
    this.onSteamUsernameChange(username);
  }

  onInputChange(event) {
    if (event.target.nodeName !== 'INPUT') {
      return;
    }
    var username = event.target.value;
    if (typeof username === 'string') {
      username = username.trim();
    }
    this.onSteamUsernameChange(username);
  }

  onSteamUsernameChange(username) {
    this.setState({username: username});
    if (typeof username === 'undefined' || username.length < 1) {
      LocalStorage.delete('steam-username');
      LocalStorage.delete('steam-id');
    } else if (LocalStorage.get('steam-username') !== username) {
      LocalStorage.set('steam-username', username);
      LocalStorage.delete('steam-id');
      Steam.getSteamId(username).then(this.onSteamIdFetched.bind(this));
    }
  }

  onSteamIdFetched(data) {
    LocalStorage.set('steam-id', data.response.steamid);
  }

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>{title}</h1>
          <form className={s.steamUsernameForm} onSubmit={this.onFormSubmit.bind(this)}>
            <label htmlFor="steam-username">
              Your Steam user name:
            </label>
            <input type="text" ref="username" id="steam-username" autofocus="autofocus" placeholder="e.g., cheshire137" onChange={this.onInputChange} />
            <p className={s.helpBlock}>
              Your Steam profile must be public.
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default SteamLookupPage;
