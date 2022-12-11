import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import Achievement from '../models/Achievement'

interface Results {
  iconUri?: string;
  achievements?: Achievement[];
  unlockedAchievements?: Achievement[];
  fetching: boolean;
  error?: string;
}

function useGetAchievements(steamID: string, appID: number): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const result = await SteamApi.getAchievements(steamID, appID)
        setResults({
          achievements: result.achievements,
          unlockedAchievements: result.unlockedAchievements,
          iconUri: result.iconUri,
          fetching: false,
        })
      } catch (err: any) {
        console.error(`failed to fetch Steam achievements for user ${steamID}, game ${appID}`, err)
        setResults({ fetching: false, error: err.message })
      }
    }

    if (appID > 0) {
      fetchAchievements()
    } else {
      setResults({ fetching: false, achievements: [], unlockedAchievements: [] })
    }
  }, [steamID, appID])

  return results
}

export default useGetAchievements
