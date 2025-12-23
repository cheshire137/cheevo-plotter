import {useEffect} from 'react'
import {AxiosError} from 'axios'
import {EyeClosedIcon} from '@primer/octicons-react'
import {useQueryClient} from '@tanstack/react-query'
import type {SteamUser} from '../types'
import {useGetAchievements} from '../queries/use-get-achievements'
import {useGetCurrentUser} from '../queries/use-get-current-user'
import {useGetFriends} from '../queries/use-get-friends'
import {SteamUserLink} from './SteamUserLink'
import './SelectedFriendsList.css'

export function SelectedFriendsList({appId, friends}: {appId: string; friends: SteamUser[]}) {
  const {data: currentUser} = useGetCurrentUser()
  if (!currentUser) return null

  return (
    <div className="selected-friends-list">
      <SelectedFriendListItem appId={appId} user={currentUser} key={currentUser.steamId} />
      {friends.map(friend => (
        <SelectedFriendListItem appId={appId} user={friend} key={friend.steamId} />
      ))}
    </div>
  )
}

function SelectedFriendListItem({appId, user}: {appId: string; user: SteamUser}) {
  const {data: achievements, error} = useGetAchievements({appId, steamId: user.steamId})
  const totalUnlocked = achievements ? achievements.filter(a => a.unlocked).length : 0
  const privateProfile = error !== null && error instanceof AxiosError && error.status === 403
  const queryClient = useQueryClient()
  const {queryKey: friendsQueryKey, data: friends} = useGetFriends()

  useEffect(() => {
    if (privateProfile && friends) {
      const newFriends = friends.map(friend => {
        if (friend.steamId === user.steamId) {
          return {...friend, privateProfile: true}
        }
        return friend
      })
      queryClient.setQueryData(friendsQueryKey, newFriends)
    }
  }, [friends, privateProfile, queryClient])

  return (
    <div>
      <SteamUserLink user={user} />
      {privateProfile ? (
        <span className="friend-achievements-error">
          <EyeClosedIcon /> profile is private
        </span>
      ) : (
        error && <span className="friend-achievements-error">{error.message}</span>
      )}
      {achievements && (
        <>
          <span>
            {totalUnlocked} unlocked of {achievements.length}
          </span>
          <strong> ({Math.round((totalUnlocked / achievements.length) * 100)}%)</strong>
        </>
      )}
    </div>
  )
}
