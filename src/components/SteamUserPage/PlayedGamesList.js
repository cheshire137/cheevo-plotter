import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import SteamGame from './SteamGame';

class PlayedGamesList extends Component {
  render() {
    return (
      <ul>
        {this.props.games.map((appId) => {
          return <SteamGame appId={appId} steamId={this.props.steamId} />;
        })}
      </ul>
    );
  }
}

export default PlayedGamesList;
