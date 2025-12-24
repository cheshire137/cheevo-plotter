import {useCallback, useEffect, useMemo, useState} from 'react'
import {AxiosError} from 'axios'
import {Banner, Spinner} from '@primer/react'
import {EyeClosedIcon} from '@primer/octicons-react'
import {useQueryClient} from '@tanstack/react-query'
import type {SteamPlayerAchievement, SteamUser} from '../types'
import {useGetAchievements} from '../queries/use-get-achievements'
import {useGetCurrentUser} from '../queries/use-get-current-user'
import {useGetFriends} from '../queries/use-get-friends'
import {SteamUserLink} from './SteamUserLink'
import {AchievementsChart} from './AchievementsChart'
import './SelectedFriendsList.css'

export function SelectedFriendsList({appId, friends}: {appId: string; friends: SteamUser[]}) {
  const {data: currentUser} = useGetCurrentUser()
  const {data, error, isPending} = useGetAchievements({appId})
  const [allPlayerAchievements, setAllPlayerAchievements] = useState<SteamPlayerAchievement[]>([])
  const gameAchievements = data?.gameAchievements
  const playersBySteamId = useMemo(() => {
    const result: Record<string, SteamUser> = {}
    if (currentUser) {
      result[currentUser.steamId] = currentUser
    }
    for (const friend of friends) {
      result[friend.steamId] = friend
    }
    return result
  }, [currentUser, friends])

  const onPlayerAchievementsLoaded = useCallback(
    (playerAchievements: SteamPlayerAchievement[]) => {
      const uniquePlayerAchievements = new Set([...allPlayerAchievements, ...playerAchievements])
      const newValue = Array.from(uniquePlayerAchievements)
      if (newValue.length !== allPlayerAchievements.length) setAllPlayerAchievements(newValue)
    },
    [allPlayerAchievements]
  )

  if (!currentUser) return null
  if (isPending) return <Spinner />
  if (gameAchievements && gameAchievements.length < 1) return null

  if (error) {
    return (
      <Banner variant="critical" title="Error loading achievements">
        {error.message}
      </Banner>
    )
  }

  return (
    <>
      <div className="selected-friends-list">
        <SelectedFriendListItem
          onPlayerAchievementsLoaded={onPlayerAchievementsLoaded}
          appId={appId}
          user={currentUser}
          key={currentUser.steamId}
        />
        {friends.map(friend => (
          <SelectedFriendListItem
            onPlayerAchievementsLoaded={onPlayerAchievementsLoaded}
            appId={appId}
            user={friend}
            key={friend.steamId}
          />
        ))}
      </div>
      <AchievementsChart playerAchievements={allPlayerAchievements} playersBySteamId={playersBySteamId} />
    </>
  )
}

function SelectedFriendListItem({
  appId,
  onPlayerAchievementsLoaded,
  user,
}: {
  appId: string
  onPlayerAchievementsLoaded: (playerAchievements: SteamPlayerAchievement[]) => void
  user: SteamUser
}) {
  const {data, error} = useGetAchievements({appId, steamId: user.steamId})
  const playerAchievements = useMemo(() => (data ? Object.values(data.playerAchievementsById) : []), [data])
  const totalUnlocked = playerAchievements.filter(a => a.unlocked).length
  const totalAchievements = data?.gameAchievements ? data.gameAchievements.length : 0
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

  useEffect(() => {
    if (playerAchievements.length > 0) onPlayerAchievementsLoaded(playerAchievements)
  }, [onPlayerAchievementsLoaded, playerAchievements])

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
      {totalAchievements > 0 && (
        <>
          <span>
            {totalUnlocked} unlocked of {totalAchievements}
          </span>
          <strong> ({Math.round((totalUnlocked / totalAchievements) * 100)}%)</strong>
        </>
      )}
    </div>
  )
}
