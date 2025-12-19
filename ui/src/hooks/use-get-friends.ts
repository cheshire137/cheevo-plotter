import { useState, useEffect } from "react"
import SteamApi from '../models/SteamApi'
import LocalStorage from '../models/LocalStorage'
import Friend from '../models/Friend'

interface Results {
  friends?: Friend[];
  fetching: boolean;
  error?: string;
}

function useGetFriends(steamID: string): Results {
  const [results, setResults] = useState<Results>({ fetching: true })

  useEffect(() => {
    async function fetchFriends() {
      const cachedFriendsData = LocalStorage.get('steam-friends')
      if (typeof cachedFriendsData === 'object') {
        const cachedFriends: Friend[] = cachedFriendsData.map((data: any) => new Friend(data))
        setResults({ friends: cachedFriends, fetching: false })
        return
      }

      try {
        const friends = await SteamApi.getFriends(steamID)
        setResults({ friends, fetching: false })
        LocalStorage.set('steam-friends', friends)
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
