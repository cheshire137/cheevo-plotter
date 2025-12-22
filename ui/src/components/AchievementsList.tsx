import {Banner, CounterLabel, Heading, Spinner} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import {TrophyIcon} from '@primer/octicons-react'
import {AchievementListItem} from './AchievementListItem'
import type {SteamOwnedGame} from '../types'
import {useGetAchievements} from '../queries/use-get-achievements'
import './AchievementsList.css'

export function AchievementsList({game}: {game: SteamOwnedGame}) {
  const {data: achievements, error, isPending} = useGetAchievements({appId: game.appId})
  const totalAchievements = achievements?.length ?? 0

  if (isPending) return <Spinner />

  if (error)
    return (
      <Banner title="Achievements error" variant="critical">
        {error.message}
      </Banner>
    )

  if (totalAchievements < 1) {
    return (
      <Blankslate>
        <Blankslate.Visual>
          <TrophyIcon size="medium" />
        </Blankslate.Visual>
        <Blankslate.Heading>{game.name} has no achievements</Blankslate.Heading>
      </Blankslate>
    )
  }

  return (
    <>
      <Heading as="h2" className="achievements-heading">
        Achievements <CounterLabel>{achievements.length}</CounterLabel>
      </Heading>
      <ul className="achievements-list">
        {achievements.map(achievement => (
          <AchievementListItem key={achievement.id} achievement={achievement} />
        ))}
      </ul>
    </>
  )
}
