import {useQuery} from '@tanstack/react-query'
import axios from 'axios'

export function useGetFriends() {
  const queryKey = ['steam-friends']
  const result = useQuery<string[], Error>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<{friendIds: string[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/api/steam-friends`,
        {
          withCredentials: true, // Send cookies with request
        }
      )
      return response.data.friendIds
    },
    retry: false, // Don't retry if not authenticated
  })
  return {...result, queryKey}
}
