import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import Player from './Player';

class PlayersList extends Component {
  render() {
    const achievements = this.props.achievements || {};
    return (
      <div className={s.playersListWrapper}>
        <span className={s.intro}>Comparing:</span>
        <ul className={s.playersList}>
          {this.props.players.map((player) => {
            const playerAchievements = achievements[player.steamid];
            return <Player key={player.steamid} player={player}
                           achievements={playerAchievements} />;
          })}
        </ul>
      </div>
    );
  }
}

export default PlayersList;
