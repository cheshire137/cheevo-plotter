import React, { useState, useEffect } from 'react';
import SteamLookupPage from './components/SteamLookupPage';
import SteamUserPage from './components/SteamUserPage';
import SteamGamePage from './components/SteamGamePage';
import LocalStorage from './models/LocalStorage';
import './App.css';

const persistUsernameChange = (username: string, steamID?: string) => {
  if (typeof steamID === 'string') {
    LocalStorage.set('steam-id', steamID);
  } else {
    LocalStorage.delete('steam-id');
  }
  LocalStorage.delete('steam-games');
  LocalStorage.delete('steam-selected-friends');
  if (username.length < 1) {
    LocalStorage.delete('steam-username');
  } else {
    LocalStorage.set('steam-username', username)
  }
}

function App() {
  const [appID, setAppID] = useState<number | null>(null)
  const [username, setUsername] = useState<string>(LocalStorage.get('steam-username') || "")
  const onAppIDChange = (newAppID: number) => setAppID(newAppID)

  const onUsernameChange = (newUsername: string) => {
    persistUsernameChange(newUsername)
    setUsername(newUsername)
  }

  if (username.length < 1) {
    return <SteamLookupPage onUsernameChange={onUsernameChange} />
  }

  if (appID !== null) {
    return <SteamGamePage steamUsername={username} appID={appID} onUsernameChange={onUsernameChange} />
  }

  return <SteamUserPage loadSteamGame={onAppIDChange} steamUsername={username} onUsernameChange={onUsernameChange} />
}

export default App;
