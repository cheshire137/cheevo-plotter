import {useQuery} from '@tanstack/react-query'
import axios from 'axios'

export function useGetCurrentUser() {
  return useQuery<string, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get<{steamId: string}>(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
        withCredentials: true, // Send cookies with request
      })
      return response.data.steamId
    },
    retry: false, // Don't retry if not authenticated
  })
}
