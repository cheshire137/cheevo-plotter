import {useState, useEffect} from 'react'
import SteamApi from '../models/SteamApi'
import Game from '../models/Game'

interface Results {
  games?: Game[]
  fetching: boolean
  error?: string
}

function useGetGames(steamID?: string | null, username?: string): Results {
  const [results, setResults] = useState<Results>({fetching: true})

  useEffect(() => {
    async function fetchGames() {
      if (!steamID) {
        setResults({fetching: false})
        return
      }

      try {
        const playedGames = await SteamApi.getOwnedPlayedGames(steamID, username)
        setResults({games: playedGames, fetching: false})
      } catch (err: any) {
        console.error('failed to fetch Steam games for ' + steamID, err)
        setResults({fetching: false, error: err.message})
      }
    }

    fetchGames()
  }, [steamID, username])

  return results
}

export default useGetGames
