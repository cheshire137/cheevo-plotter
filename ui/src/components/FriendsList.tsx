import {useMemo, useState} from 'react'
import {EyeClosedIcon, SearchIcon} from '@primer/octicons-react'
import {ActionList, Avatar, FormControl, TextInput} from '@primer/react'
import type {SteamUser} from '../types'
import {maxSelectedFriends, useSelectedFriends} from '../contexts/selected-friends-context'
import {useGetFriends} from '../queries/use-get-friends'
import './FriendsList.css'

export function FriendsList() {
  const {data: allFriends} = useGetFriends()
  const [searchFilter, setSearchFilter] = useState('')
  const filteredFriends = useMemo(() => {
    if (!allFriends) return []
    if (searchFilter.trim().length < 1) return allFriends
    return allFriends.filter(friend => friend.name.toLowerCase().includes(searchFilter.toLowerCase()))
  }, [allFriends, searchFilter])
  const {selectedFriendIds, toggleFriendSelection} = useSelectedFriends()

  return (
    <>
      <FormControl className="search-friends">
        <FormControl.Label visuallyHidden>Search friends</FormControl.Label>
        <TextInput
          block
          leadingVisual={SearchIcon}
          value={searchFilter}
          onChange={e => setSearchFilter(e.currentTarget.value)}
          type="search"
          placeholder="Filter friends"
        />
      </FormControl>
      <ActionList role="menu" aria-label="Friend" selectionVariant="multiple">
        {filteredFriends.map(friend => {
          const selected = selectedFriendIds.has(friend.steamId)
          return (
            <FriendsListItem
              selected={selected}
              disabled={!selected && selectedFriendIds.size >= maxSelectedFriends}
              onSelect={() => toggleFriendSelection(friend.steamId)}
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
