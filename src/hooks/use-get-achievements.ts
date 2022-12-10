import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import Achievement from '../models/Achievement'

interface Results {
  iconUri?: string;
  achievements?: Achievement[];
  fetching: boolean;
  error?: string;
}

function useGetAchievements(steamID: string, appID: number): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const result = await SteamApi.getAchievements(steamID, appID)
        setResults({ achievements: result.achievements, iconUri: result.iconUri, fetching: false })
      } catch (err: any) {
        console.error('failed to fetch Steam player summaries', err)
        setResults({ fetching: false, error: err.message })
      }
    }

    if (steamID.length > 0 && appID > 0) {
      fetchAchievements()
    } else {
      setResults({ fetching: false, achievements: [] })
    }
  }, [steamID, appID])

  return results
}

export default useGetAchievements
