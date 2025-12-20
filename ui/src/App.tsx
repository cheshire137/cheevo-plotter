import {useState, useEffect} from 'react'
import SteamLookupPage from './components/SteamLookupPage'
import SteamUserPage from './components/SteamUserPage'
import SteamGamePage from './components/SteamGamePage'
import SteamUserError from './components/SteamUserError'
import useGetSteamID from './hooks/use-get-steam-id'
import {areStringArraysEqual} from './models/Utils'
import {BaseStyles, ThemeProvider, Spinner} from '@primer/react'
import type {SteamGame, SteamUser} from './types'
import './App.css'

function App() {
  const [game, setGame] = useState<SteamGame | null>(null)
  const [username, setUsername] = useState<string>('')
  const {data: steamIDFromUsername, error, isPending} = useGetSteamID(username)
  const [steamID, setSteamID] = useState<string | null>(null)
  const [playerSummary, setPlayerSummary] = useState<SteamUser | null>(null)
  const [players, setPlayers] = useState<SteamUser[]>([])
  const [loadedPlayer, setLoadedPlayer] = useState<SteamUser | null>(null)

  useEffect(() => {
    if (!isPending && steamIDFromUsername) {
      setSteamID(steamIDFromUsername)
    }
    if (!isPending && steamIDFromUsername && playerSummary) {
      setLoadedPlayer(playerSummary)
    }
  }, [steamIDFromUsername, isPending, playerSummary])

  useEffect(() => {
    const url = new URL(window.location.href)
    const steamIDFromAuth = url.searchParams.get('steamid')
    if (steamIDFromAuth && steamIDFromAuth.length > 0) {
      setSteamID(steamIDFromAuth)
    }
  }, [window.location.href])

  const onUsernameChange = (newUsername: string) => {
    setUsername(newUsername)
    setPlayerSummary(null)
  }

  const setPlayerUnlockedAchievements = (steamID: string, unlockedKeys: string[]) => {
    if (
      loadedPlayer &&
      steamID === loadedPlayer.steamId &&
      !areStringArraysEqual(unlockedKeys, loadedPlayer.unlockedAchievementKeys)
    ) {
      const newLoadedPlayer = loadedPlayer
      newLoadedPlayer.setUnlockedAchievementKeys(unlockedKeys)
      console.log('setLoadedPlayer', newLoadedPlayer)
      setLoadedPlayer(newLoadedPlayer)
    }
    const index = players.map(p => p.steamId).indexOf(steamID)
    if (index > -1) {
      const existingPlayer = players[index]

      if (!areStringArraysEqual(unlockedKeys, existingPlayer.unlockedAchievementKeys)) {
        const newPlayer = existingPlayer
        newPlayer.setUnlockedAchievementKeys(unlockedKeys)
        const newPlayers = [...players]
        newPlayers[index] = newPlayer
        console.log('setPlayers', newPlayers)
        setPlayers(newPlayers)
      }
    }
  }

  let currentPage
  if (!steamID && username.length < 1) {
    currentPage = <SteamLookupPage onUsernameChange={onUsernameChange} />
  } else if (isPending) {
    currentPage = <Spinner size="large" />
  } else if (error) {
    currentPage = <SteamUserError />
  } else if (game !== null && playerSummary !== null && loadedPlayer !== null && steamID) {
    currentPage = (
      <SteamGamePage
        steamUsername={username}
        game={game}
        loadedPlayer={loadedPlayer}
        onUsernameChange={onUsernameChange}
        onGameChange={g => setGame(g)}
        selectedPlayers={players}
        setPlayerUnlockedAchievements={setPlayerUnlockedAchievements}
        steamID={steamID}
      />
    )
  } else {
    currentPage = (
      <SteamUserPage
        loadGame={g => setGame(g)}
        steamUsername={username}
        onUsernameChange={onUsernameChange}
        onPlayerSummaryChange={ps => setPlayerSummary(ps)}
        onPlayerSelectionChange={list => setPlayers(list)}
      />
    )
  }

  return (
    <ThemeProvider colorMode="dark">
      <BaseStyles>{currentPage}</BaseStyles>
    </ThemeProvider>
  )
}

export default App
