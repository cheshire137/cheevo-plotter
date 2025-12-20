import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamGame} from '../types'

export function useGetGames({steamId, username}: {steamId?: string | null; username?: string | null}) {
  const queryKey = ['steam-games', steamId, username]
  const hasSteamId = typeof steamId === 'string' && steamId.trim().length > 0
  const hasUsername = typeof username === 'string' && username.trim().length > 0
  const result = useQuery<SteamGame[], Error>({
    queryKey,
    queryFn: async () => {
      let params = '?'
      if (hasSteamId) {
        params += `steamid=${encodeURIComponent(steamId.trim())}`
      } else if (hasUsername) {
        params += `username=${encodeURIComponent(username.trim())}`
      }
      const response = await axios.get<{
        ownedGames: Array<{appId: string; playtime: number}>
        namesByAppId: Record<string, string>
      }>(`${import.meta.env.VITE_BACKEND_URL}/api/steam-owned-games${params}`)
      const {ownedGames, namesByAppId} = response.data
      return ownedGames.map(game => ({
        appId: game.appId,
        name: namesByAppId[game.appId] || game.appId,
        playtime: game.playtime,
      }))
    },
    enabled: hasSteamId || hasUsername,
  })
  return {...result, queryKey}
}
