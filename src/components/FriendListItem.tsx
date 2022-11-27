import React from 'react';

interface Props {
  onToggle(steamID: string, isChecked: boolean): void;
  isSelected: boolean;
  friend: any;
}

const FriendListItem = ({ onToggle, isSelected, friend }: Props) => {
  const domId = 'friend-' + friend.steamid;
  return <li>
    <input checked={isSelected} type="checkbox" id={domId}
      onChange={e => onToggle(friend.steamid, e.target.checked)} />
    <label htmlFor={domId}>
      <img src={friend.avatar} alt={friend.steamid} />
      <span>{friend.personaname}</span>
    </label>
  </li>
}

export default FriendListItem;
