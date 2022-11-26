import React, { Component, PropTypes } from 'react';
import s from './SteamUserPage.scss';
import Friend from './Friend';

class FriendsList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {selectedIds: props.selectedIds};
  }

  onFriendToggled(steamId, isSelected) {
    var selectedIds = this.state.selectedIds;
    const index = selectedIds.indexOf(steamId);
    if (isSelected && index < 0) {
      selectedIds.push(steamId);
    } else if (!isSelected && index > -1) {
      selectedIds = selectedIds.slice(0, index).
          concat(selectedIds.slice(index + 1));
    }
    this.setState({selectedIds: selectedIds});
    this.props.onSelectionChange(selectedIds);
  }

  render() {
    return (
      <section className={s.friends}>
        <h2>{this.props.username}'s Friends ({this.props.friends.length})</h2>
        <ul className={s.friendsList}>
          {this.props.friends.map((friend) => {
            const isSelected = this.state.selectedIds.
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
