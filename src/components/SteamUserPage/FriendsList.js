import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Friend from './Friend';

class FriendsList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {selectedFriends: []};
  }

  onFriendToggled(steamId, isSelected) {
    var selectedFriends = this.state.selectedFriends;
    const index = selectedFriends.indexOf(steamId);
    if (isSelected && index < 0) {
      selectedFriends.push(steamId);
    } else if (!isSelected && index > -1) {
      selectedFriends = selectedFriends.slice(0, index).
          concat(selectedFriends.slice(index + 1));
    }
    this.setState({selectedFriends: selectedFriends});
    this.props.onSelectionChange(selectedFriends);
  }

  render() {
    return (
      <section className={s.friends}>
        <h2>{this.props.username}'s Friends ({this.props.friends.length})</h2>
        <ul className={s.friendsList}>
          {this.props.friends.map((friend) => {
            const isSelected = this.props.selectedIds.
                indexOf(friend.steamid) > -1;
            return (
              <Friend key={friend.steamid} friend={friend}
                      isSelected={isSelected}
                      onToggle={this.onFriendToggled.bind(this)} />
            );
          }.bind(this))}
        </ul>
      </section>
    );
  }
}

export default FriendsList;
