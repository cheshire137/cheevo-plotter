import {type PropsWithChildren, useCallback, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {maxSelectedFriends, SelectedFriendsContext} from './selected-friends-context'
import {useGetFriends} from '../queries/use-get-friends'

const friendSeparator = ','

function friendIdsFromParams(searchParams: URLSearchParams) {
  const friendParam = searchParams.get('friends')
  if (friendParam && friendParam.length > 0) {
    const list = friendParam
      .split(friendSeparator)
      .map(id => id.trim())
      .slice(0, maxSelectedFriends)
    return new Set(list)
  }
  return new Set<string>()
}

export function SelectedFriendsProvider({children}: PropsWithChildren) {
  const {data: allFriends} = useGetFriends()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedFriendIds, _setSelectedFriendIds] = useState<Set<string>>(() => friendIdsFromParams(searchParams))
  const setSelectedFriendIds = useCallback(
    (val: string[]) => {
      _setSelectedFriendIds(new Set(val))
      const newSearchParams = new URLSearchParams(searchParams)
      if (val.length > 0) {
        newSearchParams.set('friends', val.slice(0, maxSelectedFriends).join(friendSeparator))
      } else {
        newSearchParams.delete('friends')
      }
      setSearchParams(newSearchParams)
    },
    [searchParams]
  )
  const toggleFriendSelection = useCallback(
    (friendId: string) => {
      let newValue: string[] = []
      if (selectedFriendIds.has(friendId)) {
        newValue = Array.from(selectedFriendIds).filter(id => id !== friendId)
      } else {
        newValue = [friendId, ...Array.from(selectedFriendIds)]
      }
      newValue = newValue.slice(0, maxSelectedFriends)
      setSelectedFriendIds(newValue)
    },
    [selectedFriendIds, setSelectedFriendIds]
  )
  const selectedFriends = useMemo(
    () => (allFriends ? allFriends.filter(f => selectedFriendIds.has(f.steamId)) : []),
    [selectedFriendIds, allFriends]
  )
  const contextProps = useMemo(
    () => ({selectedFriendIds, selectedFriends, setSelectedFriendIds, toggleFriendSelection}),
    [selectedFriendIds, selectedFriends, setSelectedFriendIds, toggleFriendSelection]
  )

  return <SelectedFriendsContext.Provider value={contextProps}>{children}</SelectedFriendsContext.Provider>
}
