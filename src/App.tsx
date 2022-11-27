import React, { useState, useEffect } from 'react';
import SteamLookupPage from './components/SteamLookupPage';
import SteamUserPage from './components/SteamUserPage';
import SteamGamePage from './components/SteamGamePage';
import LocalStorage from './models/LocalStorage';
import './App.css';

function App() {
  const [username, setUsername] = useState("")
  const [appID, setAppID] = useState<number | null>(null)

  useEffect(() => {
    setUsername(LocalStorage.get('steam-username'))
  }, [setUsername])

  const onUsernameChange = (username: string, steamID?: string) => {
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

  const onAppIDChange = (newAppID: number) => {
    setAppID(newAppID)
  }

  return (
    <div className="App">
      {username.length > 0 && appID !== null ? <SteamGamePage
        steamUsername={username} appID={appID} onUsernameChange={onUsernameChange}
      /> : username.length > 0 ? <SteamUserPage
        loadSteamGame={onAppIDChange} steamUsername={username} onUsernameChange={onUsernameChange}
      /> : <SteamLookupPage onUsernameChange={onUsernameChange} />}
    </div>
  );
}

export default App;
