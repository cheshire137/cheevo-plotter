import {useEffect, useState} from 'react'
import FriendListItem from './FriendListItem'
import Friend from '../models/Friend'
import Game from '../models/Game'
import Player from '../models/Player'
import useGetFriends from '../hooks/use-get-friends'
import {CheckboxGroup, Flash, Spinner} from '@primer/react'
import './FriendsList.css'

function FriendsList({
  steamID,
  steamUsername,
  selectedIDs,
  onPlayerSelectionChange,
  onFriendsLoaded,
  onFriendGamesLoaded,
}: {
  steamID: string
  steamUsername: string
  selectedIDs: string[]
  onPlayerSelectionChange(selectedPlayers: Player[]): void
  onFriendsLoaded(friends: Friend[]): void
  onFriendGamesLoaded(steamID: string, games: Game[]): void
}) {
  const {friends, error: friendsError, fetching: loadingFriends} = useGetFriends(steamID)
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([])

  useEffect(() => {
    if (!loadingFriends && friends) {
      onFriendsLoaded(friends)
    }
  }, [friends, loadingFriends, onFriendsLoaded])

  const onFriendToggled = (toggledFriend: Friend, isSelected: boolean) => {
    let newSelectedFriends = [...selectedFriends]
    const index = selectedIDs.indexOf(toggledFriend.steamID)
    if (isSelected && index < 0) {
      newSelectedFriends.push(toggledFriend)
    } else if (!isSelected && index > -1) {
      newSelectedFriends = newSelectedFriends.slice(0, index).concat(newSelectedFriends.slice(index + 1))
    }
    setSelectedFriends(newSelectedFriends)
    onPlayerSelectionChange(
      newSelectedFriends.filter(f => f.playerSummary).map(friend => new Player(friend.steamID, friend.playerSummary!))
    )
  }

  if (loadingFriends) {
    return (
      <div>
        <Spinner />
        <p>Loading friends list...</p>
      </div>
    )
  }

  if (friendsError) {
    return <Flash variant="danger">There was an error loading the friends list: {friendsError}.</Flash>
  }

  return (
    <CheckboxGroup>
      <CheckboxGroup.Label>
        {steamUsername}'s Friends {friends && <span>({friends.length})</span>}
      </CheckboxGroup.Label>
      <div className="friends-list">
        {friends &&
          friends.map(friend => (
            <FriendListItem
              onFriendGamesLoaded={onFriendGamesLoaded}
              key={friend.steamID}
              friend={friend}
              isSelected={selectedIDs.indexOf(friend.steamID) > -1}
              onToggle={(checked: boolean) => onFriendToggled(friend, checked)}
            />
          ))}
      </div>
    </CheckboxGroup>
  )
}

export default FriendsList
