import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import Player from '../models/Player'
import Achievement from '../models/Achievement'

interface Results {
  iconUri?: string;
  achievements?: Achievement[];
  fetching: boolean;
  error?: string;
}

function useGetAchievements(player: Player, appID: number): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const result = await SteamApi.getAchievements(player, appID)
        setResults({ achievements: result.achievements, iconUri: result.iconUri, fetching: false })
      } catch (err: any) {
        console.error(`failed to fetch Steam achievements for ${player.personaname}, ${appID}`, err)
        setResults({ fetching: false, error: err.message })
      }
    }

    if (appID > 0) {
      fetchAchievements()
    } else {
      setResults({ fetching: false, achievements: [] })
    }
  }, [player, appID])

  return results
}

export default useGetAchievements
