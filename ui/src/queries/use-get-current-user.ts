import {useQuery} from '@tanstack/react-query'
import axios, {AxiosError} from 'axios'
import type {SteamUser} from '../types'

export function useGetCurrentUser() {
  return useQuery<SteamUser, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await axios.get<SteamUser>(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
          withCredentials: true, // Send cookies with request
        })
        return response.data
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error.response?.data.error)
        }
        throw new Error(error instanceof Error ? error.message : String(error))
      }
    },
    retry: false, // Don't retry if not authenticated
  })
}
