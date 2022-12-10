import React, { useEffect } from 'react'
import FriendListItem from './FriendListItem'
import Friend from '../models/Friend'
import Game from '../models/Game'
import useGetFriends from '../hooks/use-get-friends'
import { CheckboxGroup } from '@primer/react'

interface Props {
  steamID: string;
  steamUsername: string;
  selectedIDs: string[];
  onSelectionChange(selectedFriendSteamIDs: string[]): void;
  onFriendsLoaded(friends: Friend[]): void;
  onFriendGamesLoaded(steamID: string, games: Game[]): void;
}

const FriendsList = ({ steamID, steamUsername, selectedIDs, onSelectionChange, onFriendsLoaded, onFriendGamesLoaded }: Props) => {
  const { friends, error: friendsError, fetching: loadingFriends } = useGetFriends(steamID)

  useEffect(() => {
    if (!loadingFriends && friends) {
      onFriendsLoaded(friends)
    }
  }, [friends, loadingFriends, onFriendsLoaded])

  const onFriendToggled = (toggledSteamID: string, isSelected: boolean) => {
    let newSelectedIDs = [...selectedIDs]
    const index = newSelectedIDs.indexOf(toggledSteamID)
    if (isSelected && index < 0) {
      newSelectedIDs.push(toggledSteamID)
    } else if (!isSelected && index > -1) {
      newSelectedIDs = newSelectedIDs.slice(0, index).concat(newSelectedIDs.slice(index + 1))
    }
    onSelectionChange(newSelectedIDs)
  }

  if (loadingFriends) {
    return <p>Loading friends list...</p>
  }

  if (friendsError) {
    return <p>There was an error loading the friends list: {friendsError}.</p>
  }

  return <CheckboxGroup>
    <CheckboxGroup.Label>{steamUsername}'s Friends {friends && <span>({friends.length})</span>}</CheckboxGroup.Label>
    {friends && friends.map(friend => <FriendListItem onFriendGamesLoaded={onFriendGamesLoaded}
      key={friend.steamID} friend={friend} isSelected={selectedIDs.indexOf(friend.steamID) > -1}
      onToggle={(id: string, checked: boolean) => onFriendToggled(id, checked)} />
    )}
  </CheckboxGroup>
}

export default FriendsList;
