import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamUser} from '../types'

export function useGetCurrentUser() {
  return useQuery<SteamUser, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get<SteamUser>(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
        withCredentials: true, // Send cookies with request
      })
      return response.data
    },
    retry: false, // Don't retry if not authenticated
  })
}
