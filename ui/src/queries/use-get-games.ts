import {useQuery} from '@tanstack/react-query'
import axios from 'axios'
import type {SteamOwnedGame} from '../types'

export function useGetGames() {
  const queryKey = ['steam-games']
  const result = useQuery<SteamOwnedGame[], Error>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<{
        ownedGames: Array<{appId: string; playtime: number; steamId: string}>
        namesByAppId: Record<string, string>
      }>(`${import.meta.env.VITE_BACKEND_URL}/api/steam-owned-games`, {
        withCredentials: true, // Send cookies with request
      })
      const {ownedGames, namesByAppId} = response.data
      return ownedGames.map(game => ({
        appId: game.appId,
        steamId: game.steamId,
        name: namesByAppId[game.appId] || game.appId,
        playtime: game.playtime,
      }))
    },
    retry: false, // Don't retry if not authenticated
  })
  return {...result, queryKey}
}
