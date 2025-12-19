import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamGame} from '../types'

function useGetGames({steamId, username}: {steamId?: string | null; username?: string}) {
  const queryKey = ['steam-games', steamId, username]
  const result = useQuery<SteamGame[], Error>({
    queryKey,
    queryFn: async () => {
      let params = '?'
      if (steamId && steamId.trim().length > 0) {
        params += `steamid=${encodeURIComponent(steamId.trim())}`
      } else if (username && username.trim().length > 0) {
        params += `username=${encodeURIComponent(username.trim())}`
      }
      const response = await axios.get<{
        ownedGames: Array<{appId: string; playtime: number}>
        namesByAppId: Record<string, string>
      }>(`${import.meta.env.VITE_BACKEND_URL}/api/steam-owned-games?${params}`)
      const {ownedGames, namesByAppId} = response.data
      return ownedGames.map(game => ({
        appId: game.appId,
        name: namesByAppId[game.appId] || game.appId,
        playtime: game.playtime,
      }))
    },
    enabled: (steamId && steamId.trim().length > 0) || (username && username.trim().length > 0) || false,
  })
  return {...result, queryKey}
}

export default useGetGames
