import {Avatar, Link} from '@primer/react'
import type {SteamUser} from '../types'
import './SteamUserLink.css'

export function SteamUserLink({user}: {user: SteamUser}) {
  return (
    <Link href={user.profileUrl}>
      {user.avatarUrl.length > 0 && <Avatar className="steam-user-avatar" src={user.avatarUrl} />}
      <span className="steam-user-name">{user.name}</span>
    </Link>
  )
}
