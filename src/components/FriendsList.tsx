import React, { useState, useEffect } from 'react'
import FriendListItem from './FriendListItem'
import useGetFriends from '../hooks/use-get-friends'

interface Props {
  steamID: string;
  steamUsername: string;
  initiallySelectedIDs: string[];
  onSelectionChange(selectedFriendSteamIDs: string[]): void;
  onFriendSteamIDsLoaded(friendSteamIDs: string[]): void;
}

// const fetchFriends = async (steamID: string) => {
//   if (friendsError) return

//   let data: any
//   try {
//     data = await SteamApi.getFriends(steamID)
//   } catch (err) {
//     console.error('failed to fetch Steam friends', err);
//     setFriendsError(true)
//     return
//   }

//   const friendIds = data.friendslist.friends.map((f: any) => f.steamid).concat([steamID]);
//   let summaries: any
//   try {
//     summaries = await SteamApi.getPlayerSummaries(friendIds)
//     setFriendsError(false)
//   } catch (err) {
//     console.error('failed to fetch friend summaries', err);
//     return
//   }

//   // See https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
//   // communityvisibilitystate 3 means the profile is public.
//   // Need public profiles to see owned/played games for comparison.
//   const publicFriends = summaries.filter((p: any) => p.communityvisibilitystate === 3 && p.steamid !== steamID);
//   const loadedPlayerSummary = summaries.filter((p: any) => p.steamid === steamID)[0];
//   loadedPlayerSummary.username = getUsernameFromProfileUrl(loadedPlayerSummary.profileurl) || steamUsername;
//   setPlayerSummary(loadedPlayerSummary)
//   setFriends(publicFriends)
//   if (loadedPlayerSummary.username !== steamUsername) {
//     onUsernameChange(loadedPlayerSummary.username)
//   }
// }

const FriendsList = ({ steamID, steamUsername, initiallySelectedIDs, onSelectionChange, onFriendSteamIDsLoaded }: Props) => {
  const [selectedIDs, setSelectedIDs] = useState<string[]>(initiallySelectedIDs)
  const { friends, error: friendsError, fetching: loadingFriends } = useGetFriends(steamID)

  useEffect(() => {
    if (!loadingFriends && friends) {
      onFriendSteamIDsLoaded(friends.map((f: any) => f.steamid))
    }
  }, [friends, loadingFriends, onFriendSteamIDsLoaded])

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

  if (loadingFriends) {
    return <p>Loading friends list...</p>
  }

  if (friendsError) {
    return <p>There was an error loading the friends list: {friendsError}.</p>
  }

  return <section>
    <h2>
      {steamUsername}'s Friends
      {friends && <span>({friends.length})</span>}
    </h2>
    <ul>
      {friends && friends.map(friend => <FriendListItem
        key={friend.steamID} friend={friend} isSelected={selectedIDs.indexOf(friend.steamID) > -1}
        onToggle={(id: string, checked: boolean) => onFriendToggled(id, checked)} />
      )}
    </ul>
  </section>
}

export default FriendsList;
