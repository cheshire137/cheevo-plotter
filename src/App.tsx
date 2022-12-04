import React, { useState } from 'react'
import SteamLookupPage from './components/SteamLookupPage'
import SteamUserPage from './components/SteamUserPage'
import SteamGamePage from './components/SteamGamePage'
import LocalStorage from './models/LocalStorage'
import Game from './models/Game'
import './App.css'

const persistUsernameChange = (username: string, steamID?: string) => {
  if (typeof steamID === 'string') {
    LocalStorage.set('steam-id', steamID)
  } else {
    LocalStorage.delete('steam-id')
  }
  LocalStorage.delete('steam-games')
  LocalStorage.delete('steam-selected-friends')
  LocalStorage.delete('steam-friends')
  if (username.length < 1) {
    LocalStorage.delete('steam-username')
  } else {
    LocalStorage.set('steam-username', username)
  }
}

function App() {
  const [game, setGame] = useState<Game | null>(null)
  const [username, setUsername] = useState<string>(LocalStorage.get('steam-username') || "")

  const onUsernameChange = (newUsername: string) => {
    persistUsernameChange(newUsername)
    setUsername(newUsername)
  }

  if (username.length < 1) {
    return <SteamLookupPage onUsernameChange={onUsernameChange} />
  }

  if (game !== null) {
    return <SteamGamePage steamUsername={username} game={game} onUsernameChange={onUsernameChange} />
  }

  return <SteamUserPage loadGame={g => setGame(g)} steamUsername={username} onUsernameChange={onUsernameChange} />
}

export default App
