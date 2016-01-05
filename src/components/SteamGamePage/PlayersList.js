import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import Player from './Player';

class PlayersList extends Component {
  render() {
    const achievements = this.props.achievements || {};
    return (
      <ul className={s.playersList}>
        <li className={s.intro}>Comparing:</li>
        {this.props.players.map((player) => {
          const playerAchievements = achievements[player.steamid];
          return <Player key={player.steamid} player={player}
                         achievements={playerAchievements} />;
        })}
      </ul>
    );
  }
}

export default PlayersList;
