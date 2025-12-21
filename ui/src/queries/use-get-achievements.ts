import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamGameSchema, SteamPlayerAchievement} from '../types'

interface GameAchievementsResponse {
  playerAchievements: SteamPlayerAchievement[]
  gameSchema: SteamGameSchema
}

export function useGetAchievements({appId}: {appId?: string | null}) {
  const queryKey = ['steam-achievements', appId]
  const hasAppId = typeof appId === 'string' && appId.trim().length > 0
  const result = useQuery<GameAchievementsResponse, Error>({
    queryKey,
    queryFn: async () => {
      let params = '?'
      if (hasAppId) params += `&appid=${encodeURIComponent(appId.trim())}`
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/steam-achievements${params}`
      const response = await axios.get<GameAchievementsResponse>(url)
      return response.data
    },
    enabled: hasAppId,
  })
  return {...result, queryKey}
}
