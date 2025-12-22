import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamAchievement} from '../types'

export function useGetAchievements({appId, steamId}: {appId?: string | null; steamId?: string | null}) {
  const queryKey = ['steam-achievements', appId, steamId ?? 'current-user']
  const hasAppId = typeof appId === 'string' && appId.trim().length > 0
  const hasSteamId = typeof steamId === 'string' && steamId.trim().length > 0
  const result = useQuery<SteamAchievement[], Error>({
    queryKey,
    queryFn: async () => {
      let params = '?'
      if (hasAppId) params += `&appid=${encodeURIComponent(appId.trim())}`
      if (hasSteamId) params += `&steamid=${encodeURIComponent(steamId.trim())}`
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/steam-achievements${params}`
      const response = await axios.get<{achievements: SteamAchievement[]}>(url, {
        withCredentials: true, // Send cookies with request
      })
      return response.data.achievements
    },
    enabled: hasAppId,
    retry: false, // Don't retry if not authenticated
  })
  return {...result, queryKey}
}
