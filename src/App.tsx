import React, { useState } from 'react'
import SteamLookupPage from './components/SteamLookupPage'
import SteamUserPage from './components/SteamUserPage'
import SteamGamePage from './components/SteamGamePage'
import LocalStorage from './models/LocalStorage'
import useGetSteamID from './hooks/use-get-steam-id'
import Game from './models/Game'
import Player from './models/Player'
import PlayerSummary from './models/PlayerSummary'
import { ThemeProvider, theme as primer } from "@primer/react"
import './App.css'

const persistUsernameChange = (username: string, steamID?: string) => {
  const existingUsername = LocalStorage.get('steam-username')
  const existingSteamID = LocalStorage.get('steam-id')
  const isNewUsername = existingUsername !== username

  if (typeof steamID === 'string' && steamID.length > 0) {
    if (existingSteamID !== steamID) {
      LocalStorage.set('steam-id', steamID)
    }
  } else if (isNewUsername) {
    LocalStorage.delete('steam-id')
  }
  if (isNewUsername) {
    LocalStorage.delete('steam-games')
    LocalStorage.delete('steam-selected-friends')
    LocalStorage.delete('steam-friends')
  }
  if (username.length < 1) {
    LocalStorage.delete('steam-username')
  } else if (isNewUsername) {
    LocalStorage.set('steam-username', username)
  }
}

function App() {
  const [game, setGame] = useState<Game | null>(null)
  const [username, setUsername] = useState<string>(LocalStorage.get('steam-username') || "")
  const { steamID, error: steamIDError, fetching: loadingSteamID } = useGetSteamID(username)
  const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null)
  const [players, setPlayers] = useState<Player[]>([])

  const onUsernameChange = (newUsername: string) => {
    persistUsernameChange(newUsername, steamID)
    setUsername(newUsername)
    setPlayerSummary(null)
  }

  let currentPage
  if (username.length < 1) {
    currentPage = <SteamLookupPage onUsernameChange={onUsernameChange} />
  } else if (game !== null && playerSummary !== null) {
    currentPage = <SteamGamePage
      steamUsername={username}
      game={game}
      onUsernameChange={onUsernameChange}
      playerSummary={playerSummary}
      onGameChange={g => setGame(g)}
      players={players}
    />
  } else {
    currentPage = <SteamUserPage
      loadGame={g => setGame(g)}
      steamUsername={username}
      onUsernameChange={onUsernameChange}
      onPlayerSummaryChange={ps => setPlayerSummary(ps)}
      onPlayerSelectionChange={list => setPlayers(list)}
    />
  }

  return <ThemeProvider theme={primer}>
    {currentPage}
  </ThemeProvider>
}

export default App
