import {useMemo, useState} from 'react'
import {ActionList, Avatar, FormControl, TextInput, PageLayout, Button, Heading, Spinner} from '@primer/react'
import {EyeClosedIcon, SearchIcon} from '@primer/octicons-react'
import {maxSelectedFriends, useSelectedFriends} from '../contexts/selected-friends-context'
import {useSelectedGame} from '../contexts/selected-game-context'
import {useGetFriends} from '../queries/use-get-friends'
import type {SteamUser} from '../types'
import './FriendsPane.css'

export function FriendsPane() {
  const {data: allFriends, isPending: isFriendsPending} = useGetFriends()
  const {selectedFriendIds, toggleFriendSelection} = useSelectedFriends()
  const {selectedGame} = useSelectedGame()
  const [searchFilter, setSearchFilter] = useState('')
  const filteredFriends = useMemo(() => {
    if (!allFriends) return []
    if (searchFilter.trim().length < 1) return allFriends
    return allFriends.filter(friend => friend.name.toLowerCase().includes(searchFilter.toLowerCase()))
  }, [allFriends, searchFilter])

  if (!selectedGame) return null
  if (!isFriendsPending && !allFriends) return null

  return (
    <PageLayout.Pane aria-label="Friends" position="end" divider="line">
      {isFriendsPending && <Spinner />}
      {allFriends && (
        <>
          <FriendsHeader totalSelected={selectedFriendIds.size} totalFriends={allFriends.length} />
          <SearchFriends searchFilter={searchFilter} setSearchFilter={setSearchFilter} />
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
      )}
    </PageLayout.Pane>
  )
}

function FriendsHeader({totalSelected, totalFriends}: {totalSelected: number; totalFriends: number}) {
  return (
    <Heading as="h2">
      Friends
      <span className="selected-friends-count">
        {totalSelected} of {totalFriends} selected
      </span>
      {totalSelected > 0 && <ClearFriendSelectionButton />}
    </Heading>
  )
}

function SearchFriends({
  searchFilter,
  setSearchFilter,
}: {
  searchFilter: string
  setSearchFilter: (val: string) => void
}) {
  return (
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

function ClearFriendSelectionButton() {
  const {setSelectedFriendIds} = useSelectedFriends()
  return (
    <Button
      size="small"
      className="clear-selected-friends"
      variant="invisible"
      onClick={() => setSelectedFriendIds([])}
    >
      Clear
    </Button>
  )
}
