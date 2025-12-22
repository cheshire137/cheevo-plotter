import {useQuery} from '@tanstack/react-query'
import axios, {AxiosError} from 'axios'
import type {SteamUser} from '../types'

export function useGetFriends() {
  const queryKey = ['steam-friends']
  const result = useQuery<SteamUser[], Error>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await axios.get<{friends: SteamUser[]}>(
          `${import.meta.env.VITE_BACKEND_URL}/api/steam-friends`,
          {
            withCredentials: true, // Send cookies with request
          }
        )
        return response.data.friends
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error.response?.data.error)
        }
        throw new Error(error instanceof Error ? error.message : String(error))
      }
    },
    retry: false, // Don't retry if not authenticated
  })
  return {...result, queryKey}
}
