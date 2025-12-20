import {useState} from 'react'
import AchievementComparison from './AchievementComparison'
import UnlockedBarChart from './UnlockedBarChart'
import Filters from './Filters'
import Achievement from '../models/Achievement'
import type {SteamUser} from '../types'

enum AchievementFilter {
  AllUnlocked = 'allUnlocked',
  NoneUnlocked = 'noneUnlocked',
}

const AchievementsComparison = ({players, achievements}: {players: SteamUser[]; achievements: Achievement[]}) => {
  const [filters, setFilters] = useState<AchievementFilter[]>([])

  const onFilterChange = (activeFilters: AchievementFilter[]) => {
    setFilters(activeFilters)
  }

  const includeAchievement = (achievement: Achievement) => {
    if (filters.length < 1) {
      return true
    }
    let allUnlocked = true,
      noneUnlocked = true
    for (const player of players) {
      if (player.hasAchievement(achievement.key)) {
        noneUnlocked = false
      } else {
        allUnlocked = false
      }
      if (!allUnlocked && !noneUnlocked) {
        break
      }
    }
    if (filters.includes(AchievementFilter.AllUnlocked) && !allUnlocked) {
      return false
    }
    if (filters.includes(AchievementFilter.NoneUnlocked) && !noneUnlocked) {
      return false
    }
    return true
  }

  const haveAchievements = achievements.length > 0
  const filteredAchievements = achievements.filter(a => includeAchievement(a))

  return (
    <div>
      {haveAchievements ? <UnlockedBarChart achievements={achievements} players={players} /> : <p>No achievements</p>}
      {haveAchievements && (
        <>
          <hr />
          <Filters onChange={onFilterChange} filteredCount={filteredAchievements.length} />
        </>
      )}
      <ul>
        {filteredAchievements.map(achievement => (
          <AchievementComparison players={players} achievement={achievement} key={achievement.key} />
        ))}
      </ul>
    </div>
  )
}

export default AchievementsComparison
