import {useCallback, useState} from 'react'
import {ActionList, Avatar} from '@primer/react'
import type {SteamUser} from '../types'
import './FriendsList.css'

export function FriendsList({friends}: {friends: SteamUser[]}) {
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const onSelectFriend = useCallback(
    (friendId: string) => {
      if (selectedFriendIds.includes(friendId)) {
        setSelectedFriendIds(selectedFriendIds.filter(id => id !== friendId))
      } else {
        setSelectedFriendIds([...selectedFriendIds, friendId])
      }
    },
    [selectedFriendIds]
  )
  return (
    <ActionList role="menu" aria-label="Friend" selectionVariant="multiple">
      {friends.map(friend => (
        <FriendsListItem
          selected={selectedFriendIds.includes(friend.steamId)}
          onSelect={onSelectFriend}
          key={friend.steamId}
          friend={friend}
        />
      ))}
    </ActionList>
  )
}

function FriendsListItem({
  friend,
  onSelect,
  selected,
}: {
  friend: SteamUser
  onSelect: (friendId: string) => void
  selected: boolean
}) {
  return (
    <ActionList.Item
      selected={selected}
      onSelect={() => onSelect(friend.steamId)}
      aria-checked={selected}
      role="menuitemcheckbox"
    >
      {friend.avatarUrl.length > 0 && (
        <ActionList.LeadingVisual>
          <Avatar src={friend.avatarUrl} />
        </ActionList.LeadingVisual>
      )}
      {friend.name}
    </ActionList.Item>
  )
}
