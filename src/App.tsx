import React, { useState, useEffect } from 'react'
import SteamLookupPage from './components/SteamLookupPage'
import SteamUserPage from './components/SteamUserPage'
import SteamGamePage from './components/SteamGamePage'
import SteamUserError from './components/SteamUserError'
import LocalStorage from './models/LocalStorage'
import useGetSteamID from './hooks/use-get-steam-id'
import Game from './models/Game'
import Player from './models/Player'
import PlayerSummary from './models/PlayerSummary'
import { ThemeProvider, theme as primer, Spinner } from "@primer/react"
import './App.css'

const persistUsernameChange = (username: string, steamID?: string) => {
  const existingUsername = LocalStorage.get('steam-username')
  const existingSteamID = LocalStorage.get('steam-id')
  const isNewUsername = existingUsername !== username

  if (isNewUsername) {
    LocalStorage.delete('steam-id')
    LocalStorage.delete('steam-games')
    LocalStorage.delete('steam-selected-friends')
    LocalStorage.delete('steam-friends')
    LocalStorage.clearTimestampedKeys()
  } else if (typeof steamID === 'string' && steamID.length > 0 && existingSteamID !== steamID) {
    LocalStorage.set('steam-id', steamID)
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
  const [loadedPlayer, setLoadedPlayer] = useState<Player | null>(null)

  useEffect(() => {
    if (!loadingSteamID && steamID && playerSummary) {
      setLoadedPlayer(new Player(steamID, playerSummary))
    }
  }, [steamID, loadingSteamID, playerSummary])

  const onUsernameChange = (newUsername: string) => {
    persistUsernameChange(newUsername, steamID)
    setUsername(newUsername)
    setPlayerSummary(null)
  }

  const onPlayerChange = (newPlayer: Player) => {
    console.log('onPlayerChange', newPlayer.playerSummary, newPlayer.unlockedAchievements)
    if (loadedPlayer && newPlayer.steamid === loadedPlayer.steamid) {
      setLoadedPlayer(newPlayer)
    }
    const index = players.map(p => p.steamid).indexOf(newPlayer.steamid)
    if (index > -1) {
      const newPlayers = [...players]
      newPlayers[index] = newPlayer
      setPlayers(newPlayers)
    }
  }

  let currentPage
  if (username.length < 1) {
    currentPage = <SteamLookupPage onUsernameChange={onUsernameChange} />
  } else if (loadingSteamID) {
    currentPage = <Spinner size='large' />
  } else if (steamIDError) {
    currentPage = <SteamUserError />
  } else if (game !== null && playerSummary !== null && loadedPlayer !== null && steamID) {
    currentPage = <SteamGamePage
      steamUsername={username}
      game={game}
      loadedPlayer={loadedPlayer}
      onUsernameChange={onUsernameChange}
      playerSummary={playerSummary}
      onGameChange={g => setGame(g)}
      selectedPlayers={players}
      onPlayerChange={onPlayerChange}
      steamID={steamID}
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
