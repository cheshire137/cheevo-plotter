import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamGameSchema, SteamPlayerAchievement} from '../types'

interface GameAchievementsResponse {
  playerAchievements: SteamPlayerAchievement[]
  gameSchema: SteamGameSchema
}

export function useGetAchievements({steamId, appId}: {steamId?: string | null; appId?: string | null}) {
  const queryKey = ['steam-achievements', steamId, appId]
  const hasSteamId = typeof steamId === 'string' && steamId.trim().length > 0
  const hasAppId = typeof appId === 'string' && appId.trim().length > 0
  const result = useQuery<GameAchievementsResponse, Error>({
    queryKey,
    queryFn: async () => {
      let params = '?'
      if (hasSteamId) params += `steamid=${encodeURIComponent(steamId.trim())}`
      if (hasAppId) params += `&appid=${encodeURIComponent(appId.trim())}`
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/steam-achievements${params}`
      const response = await axios.get<GameAchievementsResponse>(url)
      return response.data
    },
    enabled: hasSteamId && hasAppId,
  })
  return {...result, queryKey}
}
