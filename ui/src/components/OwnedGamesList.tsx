import {useMemo, useState} from 'react'
import {ActionList, FormControl, TextInput} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import type {SteamOwnedGame} from '../types'
import './OwnedGamesList.css'
import {useSelectedGame} from '../contexts/selected-game-context'

export function OwnedGamesList({ownedGames: allOwnedGames}: {ownedGames: SteamOwnedGame[]}) {
  const {selectedGame, selectGame} = useSelectedGame()
  const selectedGameId = selectedGame?.appId
  const [searchFilter, setSearchFilter] = useState('')
  const filteredOwnedGames = useMemo(() => {
    if (searchFilter.trim().length < 1) return allOwnedGames
    return allOwnedGames.filter(game => game.name.toLowerCase().includes(searchFilter.toLowerCase()))
  }, [allOwnedGames, searchFilter])

  return (
    <>
      <FormControl className="search-owned-games">
        <FormControl.Label visuallyHidden>Search owned games</FormControl.Label>
        <TextInput
          block
          leadingVisual={SearchIcon}
          value={searchFilter}
          onChange={e => setSearchFilter(e.currentTarget.value)}
          type="search"
          placeholder="Filter games"
        />
      </FormControl>
      <ActionList selectionVariant="single" role="menu" aria-label="Owned game">
        {filteredOwnedGames.map(game => {
          const isSelected = game.appId === selectedGameId
          return (
            <ActionList.Item
              selected={isSelected}
              aria-checked={isSelected}
              onSelect={() => selectGame(game.appId)}
              key={game.appId}
              role="menuitemradio"
            >
              {game.name}
            </ActionList.Item>
          )
        })}
      </ActionList>
    </>
  )
}
