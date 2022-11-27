import React, { useState } from 'react';
import FriendListItem from './FriendListItem';

interface Props {
  steamUsername: string;
  initiallySelectedIDs: string[];
  friends: any[];
  onSelectionChange(selectedFriendSteamIDs: string[]): void;
}

const FriendsList = ({ steamUsername, initiallySelectedIDs, friends, onSelectionChange }: Props) => {
  const [selectedIDs, setSelectedIDs] = useState<string[]>(initiallySelectedIDs)

  const onFriendToggled = (steamId: string, isSelected: boolean) => {
    let newSelectedIDs = [...selectedIDs]
    const index = newSelectedIDs.indexOf(steamId)
    if (isSelected && index < 0) {
      newSelectedIDs.push(steamId)
    } else if (!isSelected && index > -1) {
      newSelectedIDs = newSelectedIDs.slice(0, index).concat(newSelectedIDs.slice(index + 1))
    }
    setSelectedIDs(newSelectedIDs)
    onSelectionChange(newSelectedIDs)
  }

  return (
    <section>
      <h2>{steamUsername}'s Friends ({friends.length})</h2>
      <ul>
        {friends.map((friend) => <FriendListItem
          key={friend.steamid}
          friend={friend}
          isSelected={selectedIDs.indexOf(friend.steamid) > -1}
          onToggle={(id: string, checked: boolean) => onFriendToggled(id, checked)} />
        )}
      </ul>
    </section>
  );
}

export default FriendsList;
