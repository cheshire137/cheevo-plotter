import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamAchievement} from '../types'

export function useGetAchievements({steamId, appId}: {steamId?: string | null; appId?: string | null}) {
  const queryKey = ['steam-achievements', steamId, appId]
  console.log('useGetAchievements', queryKey)
  const hasSteamId = typeof steamId === 'string' && steamId.trim().length > 0
  const hasAppId = typeof appId === 'string' && appId.trim().length > 0
  const result = useQuery<SteamAchievement[], Error>({
    queryKey,
    queryFn: async () => {
      let params = '?'
      if (hasSteamId) params += `steamid=${encodeURIComponent(steamId.trim())}`
      if (hasAppId) params += `&appid=${encodeURIComponent(appId.trim())}`
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/steam-achievements${params}`
      const response = await axios.get<{achievements: SteamAchievement[]}>(url)
      return response.data.achievements
    },
    enabled: hasSteamId && hasAppId,
  })
  return {...result, queryKey}
}
