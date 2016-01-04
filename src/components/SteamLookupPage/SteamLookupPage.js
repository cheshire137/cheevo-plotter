import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import s from './SteamLookupPage.scss';
import withStyles from '../../decorators/withStyles';
import _ from 'underscore';
import LocalStorage from '../../stores/localStorage';
import Steam from '../../actions/steam';
import parsePath from 'history/lib/parsePath';
import Location from '../../core/Location';

const title = 'Find Steam User';

@withStyles(s)
class SteamLookupPage extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.onInputChange = _.debounce(this.onInputChange.bind(this), 2000);
  }

  onFormSubmit(event) {
    event.preventDefault();
    var username = ReactDOM.findDOMNode(this.refs.username).value;
    this.onSteamUsernameChange(username);
  }

  onInputChange(event) {
    if (event.target.nodeName !== 'INPUT') {
      return;
    }
    this.onSteamUsernameChange(event.target.value);
  }

  onSteamUsernameChange(username) {
    if (typeof username === 'string') {
      username = username.trim();
    }
    LocalStorage.delete('steam-id');
    if (typeof username === 'undefined' || username.length < 1) {
      LocalStorage.delete('steam-username');
      return;
    }
    this.goToUserPage(username);
  }

  componentWillMount() {
    this.context.onSetTitle(title);
    var username = LocalStorage.get('steam-username');
    if (typeof username === 'string') {
      this.goToUserPage(username);
    }
  }

  goToUserPage(username) {
    Location.push({
      ...(parsePath('/steam/' + encodeURIComponent(username)))
    });
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>{title}</h1>
          <form className={s.steamUsernameForm} onSubmit={this.onFormSubmit.bind(this)}>
            <label htmlFor="steam-username">
              Steam user name:
            </label>
            <input type="text" ref="username" id="steam-username" autofocus="autofocus" placeholder="e.g., cheshire137" onChange={this.onInputChange} />
            <p className={s.helpBlock}>
              The Steam profile must be public.
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default SteamLookupPage;
