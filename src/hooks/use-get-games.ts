import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import Game from '../models/Game'
import LocalStorage from '../models/LocalStorage'

interface Results {
  games?: Game[];
  fetching: boolean;
  error?: string;
}

function useGetGames(steamID?: string | null, username?: string): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchGames() {
      const cachedSteamID = LocalStorage.get('steam-id')
      const cachedGames = LocalStorage.get('steam-games')
      if (typeof cachedSteamID === 'string' && typeof cachedGames === 'object' && cachedSteamID === steamID) {
        setResults({ games: cachedGames, fetching: false })
        return
      }

      if (!steamID) {
        setResults({ fetching: false })
        return
      }

      try {
        const playedGames = await SteamApi.getOwnedPlayedGames(steamID, username)
        setResults({ games: playedGames, fetching: false })
        if (typeof cachedSteamID === 'string' && cachedSteamID === steamID) {
          LocalStorage.set('steam-games', playedGames)
        }
      } catch (err: any) {
        console.error('failed to fetch Steam games for ' + steamID, err)
        setResults({ fetching: false, error: err.message })
      }
    }

    fetchGames()
  }, [steamID, username])

  return results
}

export default useGetGames
