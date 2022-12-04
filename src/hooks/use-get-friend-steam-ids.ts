import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'

interface Results {
  steamIDs?: string[];
  fetching: boolean;
  error?: string;
}

function useGetFriendSteamIDs(steamID: string): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchFriends() {
      try {
        const steamIDs = await SteamApi.getFriendSteamIDs(steamID)
        setResults({ steamIDs, fetching: false })
      } catch (err: any) {
        console.error('failed to fetch Steam friends', err)
        setResults({ fetching: false, error: err.message })
      }
    }
    fetchFriends()
  }, [steamID])

  return results
}

export default useGetFriendSteamIDs
