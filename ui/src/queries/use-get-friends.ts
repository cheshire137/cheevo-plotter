import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamUser} from '../types'

export function useGetFriends() {
  const queryKey = ['steam-friends']
  const result = useQuery<SteamUser[], Error>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<{friends: SteamUser[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/api/steam-friends`,
        {
          withCredentials: true, // Send cookies with request
        }
      )
      return response.data.friends
    },
    retry: false, // Don't retry if not authenticated
  })
  return {...result, queryKey}
}
