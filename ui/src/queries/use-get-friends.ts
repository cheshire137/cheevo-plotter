import {useQuery} from '@tanstack/react-query'
import axios from 'axios'

function useGetFriends(steamID: string) {
  const queryKey = ['steam-friends', steamID]
  const result = useQuery<string[], Error>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<{friendIds: string[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/api/steam-friends?steamid=${encodeURIComponent(steamID)}`
      )
      return response.data.friendIds
    },
    enabled: steamID.trim().length > 0,
  })
  return {...result, queryKey}
}

export default useGetFriends
