import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import SteamGame from './SteamGame';

class PlayedGamesList extends Component {
  render() {
    const index = Math.ceil(this.props.games.length / 2.0);
    const column1 = this.props.games.slice(0, index);
    const column2 = this.props.games.slice(index);
    return (
      <div className={s.playedGames}>
        <ul className={s.leftColumn}>
          {column1.map((appId) => {
            return <SteamGame username={this.props.username}
                              appId={appId} key={appId} />;
          }.bind(this))}
        </ul>
        <ul className={s.rightColumn}>
          {column2.map((appId) => {
            return <SteamGame username={this.props.username}
                              appId={appId} key={appId} />;
          }.bind(this))}
        </ul>
      </div>
    );
  }
}

export default PlayedGamesList;
