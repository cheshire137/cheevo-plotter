import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import LocalStorage from '../models/LocalStorage'

interface Results {
  friends?: any[];
  fetching: boolean;
  error?: string;
}

function useGetFriends(steamID: string): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchFriends() {
      const cachedFriends = LocalStorage.get('friends')
      if (typeof cachedFriends === 'object') {
        setResults({ friends: cachedFriends, fetching: false })
        return
      }

      try {
        const friends = await SteamApi.getFriends(steamID)
        setResults({ friends, fetching: false })
        LocalStorage.set('friends', friends)
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
