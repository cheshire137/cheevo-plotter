import {useCallback, useMemo, useState} from 'react'
import {EyeClosedIcon, SearchIcon} from '@primer/octicons-react'
import {useSearchParams} from 'react-router-dom'
import {ActionList, Avatar, FormControl, TextInput} from '@primer/react'
import type {SteamUser} from '../types'
import './FriendsList.css'

export const friendSeparator = ','
export const maxSelectedFriends = 5

export function FriendsList({
  friends: allFriends,
  selectedFriendIds: initialSelectedFriendIds,
}: {
  friends: SteamUser[]
  selectedFriendIds: string[]
}) {
  const [searchFilter, setSearchFilter] = useState('')
  const filteredFriends = useMemo(() => {
    if (searchFilter.trim().length < 1) return allFriends
    return allFriends.filter(friend => friend.name.toLowerCase().includes(searchFilter.toLowerCase()))
  }, [allFriends, searchFilter])
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
    <>
      <FormControl>
        <FormControl.Label visuallyHidden>Search friends</FormControl.Label>
        <TextInput
          leadingVisual={SearchIcon}
          value={searchFilter}
          onChange={e => setSearchFilter(e.currentTarget.value)}
          type="search"
          placeholder="Filter friends"
        />
      </FormControl>
      <ActionList role="menu" aria-label="Friend" selectionVariant="multiple">
        {filteredFriends.map(friend => {
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
    </>
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
      {friend.privateProfile && (
        <ActionList.TrailingVisual>
          <EyeClosedIcon />
        </ActionList.TrailingVisual>
      )}
    </ActionList.Item>
  )
}
