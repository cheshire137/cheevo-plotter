import {Banner, Spinner} from '@primer/react'
import {AchievementListItem} from './AchievementListItem'
import type {SteamOwnedGame} from '../types'
import {useGetCurrentUser} from '../queries/use-get-current-user'
import {useGetAchievements} from '../queries/use-get-achievements'
import './AchievementsList.css'

export function AchievementsList({game}: {game: SteamOwnedGame}) {
  const {data: achievements, error, isPending} = useGetAchievements({appId: game.appId})
  const totalAchievements = achievements?.length ?? 0
  const {data: currentUser} = useGetCurrentUser()
  const unlockedCount = achievements?.filter(a => a.unlocked).length ?? 0

  if (!currentUser) return null

  if (isPending) return <Spinner />

  if (error) return <Banner title="Achievements error" variant="critical">{error.message}</Banner>

  if (totalAchievements < 1) {
    return <p>{game.name} has no achievements.</p>
  }

  return (
    <div>
      <p>
        <span>
          {unlockedCount} of {totalAchievements}
        </span>
        <span> {totalAchievements === 1 ? 'achievement' : 'achievements'} unlocked</span>
        <strong> ({Math.round((unlockedCount / totalAchievements) * 100)}%)</strong>
      </p>
      <ul className="achievements-list">
        {achievements.map(achievement => (
          <AchievementListItem key={achievement.id} achievement={achievement} />
        ))}
      </ul>
    </div>
  )
}
