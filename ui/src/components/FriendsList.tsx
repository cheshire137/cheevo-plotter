import {useCallback, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {ActionList, Avatar} from '@primer/react'
import type {SteamUser} from '../types'
import './FriendsList.css'

export const friendSeparator = ','
export const maxSelectedFriends = 5

export function FriendsList({
  friends,
  selectedFriendIds: initialSelectedFriendIds,
}: {
  friends: SteamUser[]
  selectedFriendIds: string[]
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(initialSelectedFriendIds)
  const onSelectFriend = useCallback(
    (friendId: string) => {
      let newValue: string[] = []
      if (selectedFriendIds.includes(friendId)) {
        newValue = selectedFriendIds.filter(id => id !== friendId)
      } else if (selectedFriendIds.length < maxSelectedFriends) {
        newValue = [...selectedFriendIds, friendId]
      } else {
        newValue = [...selectedFriendIds]
      }
      const newParams = new URLSearchParams(searchParams)
      newParams.set('friends', newValue.join(friendSeparator))
      setSearchParams(newParams)
      setSelectedFriendIds(newValue)
    },
    [searchParams, selectedFriendIds]
  )
  return (
    <ActionList role="menu" aria-label="Friend" selectionVariant="multiple">
      {friends.map(friend => {
        const selected = selectedFriendIds.includes(friend.steamId)
        return (
          <FriendsListItem
            selected={selected}
            disabled={!selected && selectedFriendIds.length >= maxSelectedFriends}
            onSelect={onSelectFriend}
            key={friend.steamId}
            friend={friend}
          />
        )
      })}
    </ActionList>
  )
}

function FriendsListItem({
  disabled,
  friend,
  onSelect,
  selected,
}: {
  disabled?: boolean
  friend: SteamUser
  onSelect: (friendId: string) => void
  selected: boolean
}) {
  return (
    <ActionList.Item
      disabled={disabled}
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
