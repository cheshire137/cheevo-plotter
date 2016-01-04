import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Friend from './Friend';

class FriendsList extends Component {
  render() {
    return (
      <section className={s.friends}>
        <h2>{this.props.username}'s Friends ({this.props.friends.length})</h2>
        <ul className={s.friendsList}>
          {this.props.friends.map((friend) => <Friend key={friend.steamid}
                                                      friend={friend} />)}
        </ul>
      </section>
    );
  }
}

export default FriendsList;
