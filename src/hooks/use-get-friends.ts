import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'

interface Results {
  friends?: any;
  fetching: boolean;
  error?: string;
}

function useGetFriends(steamID: string): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchFriends() {
      try {
        const friends = await SteamApi.getFriends(steamID)
        setResults({ friends, fetching: false })
      } catch (err: any) {
        console.error('failed to fetch Steam friends', err)
        setResults({ fetching: false, error: err.message })
      }
    }
    fetchFriends()
  }, [steamID])

  return results
}

export default useGetFriends
