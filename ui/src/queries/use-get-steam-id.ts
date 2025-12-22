import {useQuery} from '@tanstack/react-query'
import axios, {AxiosError} from 'axios'

function useGetSteamID(username: string) {
  const queryKey = ['steam-id', username]
  const result = useQuery<string, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await axios.get<{steamId: string}>(
          `${import.meta.env.VITE_BACKEND_URL}/api/steam-user-id?username=${encodeURIComponent(username)}`
        )
        return response.data.steamId
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error.response?.data.error)
        }
        throw new Error(error instanceof Error ? error.message : String(error))
      }
    },
    enabled: username.trim().length > 0,
  })
  return {...result, queryKey}
}

export default useGetSteamID
