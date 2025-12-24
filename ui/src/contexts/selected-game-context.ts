import {createContext, useContext} from 'react'
import type {SteamOwnedGame} from '../types'

interface SelectedGameContextProps {
  selectedGame: SteamOwnedGame | undefined
  selectGame: (appId: string) => void
}

export const SelectedGameContext = createContext<SelectedGameContextProps | undefined>(undefined)

export function useSelectedGame() {
  const context = useContext(SelectedGameContext)
  if (context === undefined) {
    throw new Error('useSelectedGame must be used within a SelectedGameProvider')
  }
  return context
}
