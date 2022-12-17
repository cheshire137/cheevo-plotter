import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import LocalStorage from '../models/LocalStorage'

interface Results {
  steamID?: string;
  fetching: boolean;
  error?: string;
}

function useGetSteamID(username: string): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchSteamID() {
      const cachedSteamID = LocalStorage.get('steam-id');
      if (typeof cachedSteamID === 'string' && cachedSteamID.length > 0) {
        setResults({ steamID: cachedSteamID, fetching: false })
        return
      }

      try {
        const steamID = await SteamApi.getSteamID(username)
        setResults({ steamID, fetching: false })
        LocalStorage.set('steam-id', steamID)
      } catch (err: any) {
        console.error('failed to fetch Steam ID for username ' + username, err)
        setResults({ fetching: false, error: err.message })
      }
    }

    if (username.length > 0) {
      fetchSteamID()
    } else {
      setResults({ fetching: false })
    }
  }, [username])

  return results
}

export default useGetSteamID
