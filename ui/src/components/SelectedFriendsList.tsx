import {Avatar, Link} from '@primer/react'
import {AxiosError} from 'axios'
import {EyeClosedIcon} from '@primer/octicons-react'
import type {SteamUser} from '../types'
import {useGetAchievements} from '../queries/use-get-achievements'
import './SelectedFriendsList.css'

export function SelectedFriendsList({appId, friends}: {appId: string; friends: SteamUser[]}) {
  return (
    <div>
      {friends.map(friend => (
        <SelectedFriendListItem appId={appId} friend={friend} key={friend.steamId} />
      ))}
    </div>
  )
}

function SelectedFriendListItem({appId, friend}: {appId: string; friend: SteamUser}) {
  const {data: achievements, error} = useGetAchievements({appId, steamId: friend.steamId})
  const totalUnlocked = achievements ? achievements.filter(a => a.unlocked).length : 0
  return (
    <div>
      <Link href={friend.profileUrl}>
        {friend.avatarUrl.length > 0 && <Avatar className="selected-friend-avatar" src={friend.avatarUrl} />}
        <span className="selected-friend-name">{friend.name}</span>
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
      {achievements && <span>{totalUnlocked} unlocked</span>}
    </div>
  )
}
