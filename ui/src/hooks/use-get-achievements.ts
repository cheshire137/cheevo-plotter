import {useQuery} from '@tanstack/react-query'
import axios from 'axios'

function useGetAchievements({steamId, appId}: {steamId: string; appId: string}) {
  const queryKey = ['steam-achievements', steamId, appId]
  const result = useQuery<Record<string, unknown>, Error>({
    queryKey,
    queryFn: async () => {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/steam-achievements?` +
        `steamid=${encodeURIComponent(steamId.trim())}&appid=${encodeURIComponent(appId.trim())}`
      const response = await axios.get<Record<string, unknown>>(url)
      return response.data
    },
    enabled: steamId.trim().length > 0 && appId.trim().length > 0,
  })
  return {...result, queryKey}
}

export default useGetAchievements
