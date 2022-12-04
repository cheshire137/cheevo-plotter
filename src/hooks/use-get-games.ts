import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import Game from '../models/Game'
import LocalStorage from '../models/LocalStorage'

interface Results {
  games?: Game[];
  fetching: boolean;
  error?: string;
}
// const fetchGames = async (steamIDToFetch: string) => {
//   if (gamesError) return

//   const games = LocalStorage.get('steam-games');
//   const newOwnedGames = Object.assign({}, ownedGames)
//   if (typeof games === 'object') {
//     newOwnedGames[steamID] = games;
//     setOwnedGames(newOwnedGames)
//     updateSharedGames(newOwnedGames)
//     return
//   }

//   let playedGames
//   try {
//     playedGames = await SteamApi.getOwnedPlayedGames(steamID)
//   } catch (err) {
//     console.error('failed to fetch Steam games for ' + steamID, err);
//     setGamesError(true)
//     return
//   }

//   LocalStorage.set('steam-games', playedGames)
//   newOwnedGames[steamID] = playedGames
//   setOwnedGames(newOwnedGames)
//   setGamesError(false)
//   updateSharedGames(newOwnedGames)
// }
function useGetGames(steamID?: string | null): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchGames() {
      const cachedGames = LocalStorage.get('steam-games');
      if (typeof cachedGames === 'object') {
        setResults({ games: cachedGames, fetching: false })
        return
      }

      if (!steamID) {
        setResults({ fetching: false, games: [] })
        return
      }

      try {
        const playedGames = await SteamApi.getOwnedPlayedGames(steamID)
        setResults({ games: playedGames, fetching: false })
        LocalStorage.set('steam-games', playedGames)
      } catch (err: any) {
        console.error('failed to fetch Steam games for ' + steamID, err)
        setResults({ fetching: false, error: err.message })
      }
    }

    fetchGames()
  }, [steamID])

  return results
}

export default useGetGames
