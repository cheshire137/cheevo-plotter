import {useQuery} from '@tanstack/react-query'
import axios, {AxiosError} from 'axios'
import type {SteamUser} from '../types'

function useGetPlayerSummaries(steamIds: string[]) {
  const queryKey = ['steam-player-summaries', steamIds]
  const result = useQuery<SteamUser[], Error>({
    queryKey,
    queryFn: async () => {
      const steamIdsStr = encodeURIComponent(steamIds.join(','))
      try {
        const response = await axios.get<{players: SteamUser[]}>(
          `${import.meta.env.VITE_BACKEND_URL}/api/steam-player-summaries?steamids=${steamIdsStr}`
        )
        return response.data.players
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error.response?.data.error)
        }
        throw new Error(error instanceof Error ? error.message : String(error))
      }
    },
    enabled: steamIds.length > 0,
  })
  return {...result, queryKey}
}

export default useGetPlayerSummaries
