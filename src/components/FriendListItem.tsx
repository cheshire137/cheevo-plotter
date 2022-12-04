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
    {friend.playerSummary ? (
      <label htmlFor={domId}>
        <img src={friend.playerSummary.avatarmedium} alt={friend.steamID} />
        <span>{friend.playerSummary.personaname}</span>
      </label>
    ) : (
      <label htmlFor={domId}>{friend.steamID}</label>
    )}
  </li>
}

export default FriendListItem
