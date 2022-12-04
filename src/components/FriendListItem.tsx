import React from 'react'
import Friend from '../models/Friend'

interface Props {
  onToggle(steamID: string, isChecked: boolean): void;
  isSelected: boolean;
  friend: Friend;
}

const FriendListItem = ({ onToggle, isSelected, friend }: Props) => {
  const domId = 'friend-' + friend.steamID;
  return <li>
    <input checked={isSelected} type="checkbox" id={domId}
      onChange={e => onToggle(friend.steamID, e.target.checked)} />
    <label htmlFor={domId}>
      <img src={friend.avatar} alt={friend.steamID} />
      <span>{friend.personaname}</span>
    </label>
  </li>
}

export default FriendListItem;
