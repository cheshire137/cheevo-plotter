import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Friend from './Friend';

class FriendsList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {selectedFriends: []};
  }

  onFriendToggled(steamId, isSelected) {
    console.log(steamId, isSelected);
    var selectedFriends = this.state.selectedFriends;
    console.log('prev selected', selectedFriends);
    const index = selectedFriends.indexOf(steamId);
    if (isSelected && index < 0) {
      selectedFriends.push(steamId);
    } else if (!isSelected && index > -1) {
      selectedFriends = selectedFriends.slice(0, index).
          concat(selectedFriends.slice(index + 1));
    }
    console.log('now selected', selectedFriends);
    this.setState({selectedFriends: selectedFriends});
  }

  render() {
    return (
      <section className={s.friends}>
        <h2>{this.props.username}'s Friends ({this.props.friends.length})</h2>
        <ul className={s.friendsList}>
          {this.props.friends.map((friend) => {
            return (
              <Friend key={friend.steamid} friend={friend}
                      onToggle={this.onFriendToggled.bind(this)} />
            );
          }.bind(this))}
        </ul>
      </section>
    );
  }
}

export default FriendsList;
