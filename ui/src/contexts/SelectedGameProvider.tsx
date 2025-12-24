import {type PropsWithChildren, useCallback, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {SelectedGameContext} from './selected-game-context'
import {useGetGames} from '../queries/use-get-games'

export function SelectedGameProvider({children}: PropsWithChildren) {
  const {data: ownedGames} = useGetGames()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedGameId, setSelectedGameId] = useState<string | null>(searchParams.get('appid'))
  const selectedGame = useMemo(
    () => (ownedGames && selectedGameId ? ownedGames.find(g => g.appId === selectedGameId) : undefined),
    [ownedGames, selectedGameId]
  )
  const selectGame = useCallback(
    (appId: string) => {
      setSelectedGameId(appId)
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('appid', appId)
      setSearchParams(newSearchParams)
    },
    [searchParams, setSearchParams]
  )
  const contextProps = useMemo(() => ({selectedGame, selectGame}), [selectedGame, selectGame])
  return <SelectedGameContext.Provider value={contextProps}>{children}</SelectedGameContext.Provider>
}
