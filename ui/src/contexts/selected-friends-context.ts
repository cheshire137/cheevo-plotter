import {createContext, useContext} from 'react'
import type {SteamUser} from '../types'

export const maxSelectedFriends = 5

interface SelectedFriendsContextProps {
  selectedFriendIds: Set<string>
  selectedFriends: SteamUser[]
  toggleFriendSelection: (friendId: string) => void
  setSelectedFriendIds: (friendIds: string[]) => void
}

export const SelectedFriendsContext = createContext<SelectedFriendsContextProps | undefined>(undefined)

export function useSelectedFriends() {
  const context = useContext(SelectedFriendsContext)
  if (context === undefined) {
    throw new Error('useSelectedFriends must be used within a SelectedFriendsProvider')
  }
  return context
}
