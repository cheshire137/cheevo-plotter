import React, { Component, PropTypes } from 'react';
import s from './SteamLookupPage.scss';
import withStyles from '../../decorators/withStyles';

const title = 'Find Steam User';

@withStyles(s)
class SteamLookupPage extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>{title}</h1>
        </div>
      </div>
    );
  }
}

export default SteamLookupPage;
