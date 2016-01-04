import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import cx from 'classnames';

class PlayersList extends Component {
  render() {
    return (
      <ul className={s.playersList}>
        {this.props.players.map((player) => {
          return (
            <li className={s.player}>
              <a href={player.profileurl} target="_blank"
                 className={s.playerProfileLink}>
                <img src={player.avatar} className={s.playerAvatar}
                     alt={player.steamid} />
                <span className={s.playerName}>{player.personaname}</span>
              </a>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default PlayersList;
