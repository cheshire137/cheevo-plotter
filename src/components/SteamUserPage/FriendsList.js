import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Friend from './Friend';

class FriendsList extends Component {
  render() {
    const index = Math.ceil(this.props.friends.length / 2.0);
    const column1 = this.props.friends.slice(0, index);
    const column2 = this.props.friends.slice(index);
    return (
      <div className={s.row}>
        <div className={s.leftColumn}>
          <ul>
            {column1.map((friend) => <Friend key={friend.steamid}
                                             friend={friend} />)}
          </ul>
        </div>
        <div className={s.rightColumn}>
          <ul>
            {column2.map((friend) => <Friend key={friend.steamid}
                                             friend={friend} />)}
          </ul>
        </div>
      </div>
    );
  }
}

export default FriendsList;
