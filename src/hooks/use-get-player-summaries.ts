import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import PlayerSummary from '../models/PlayerSummary'

interface Results {
  playerSummaries?: PlayerSummary[];
  fetching: boolean;
  error?: string;
}

function useGetPlayerSummaries(steamIDs: string[]): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchPlayerSummaries() {
      try {
        const playerSummaries = await SteamApi.getPlayerSummaries(steamIDs)
        setResults({ playerSummaries, fetching: false })
      } catch (err: any) {
        console.error('failed to fetch Steam player summaries', err)
        setResults({ fetching: false, error: err.message })
      }
    }
    fetchPlayerSummaries()
  }, [steamIDs])

  return results
}

export default useGetPlayerSummaries
