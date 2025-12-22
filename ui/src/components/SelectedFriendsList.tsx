import {Avatar, Link} from '@primer/react'
import {AxiosError} from 'axios'
import {EyeClosedIcon} from '@primer/octicons-react'
import type {SteamUser} from '../types'
import {useGetAchievements} from '../queries/use-get-achievements'
import {useGetCurrentUser} from '../queries/use-get-current-user'
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
  return (
    <div>
      <Link href={user.profileUrl}>
        {user.avatarUrl.length > 0 && <Avatar className="selected-friend-avatar" src={user.avatarUrl} />}
        <span className="selected-friend-name">{user.name}</span>
      </Link>
      {error && error instanceof AxiosError && (
        <span className="friend-achievements-error">
          {error.status === 403 ? (
            <>
              <EyeClosedIcon /> profile is private
            </>
          ) : (
            <span>{error.message}</span>
          )}
        </span>
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
