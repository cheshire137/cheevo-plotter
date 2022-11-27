import React, { useState, useEffect } from 'react';
import SteamLookupPage from './components/SteamLookupPage';
import SteamUserPage from './components/SteamUserPage';
import LocalStorage from './models/LocalStorage';
import './App.css';

function App() {
  const [username, setUsername] = useState("")

  useEffect(() => {
    setUsername(LocalStorage.get('steam-username'))
  }, [setUsername])

  const onUsernameChange = (username: string) => {
    LocalStorage.delete('steam-id');
    LocalStorage.delete('steam-games');
    LocalStorage.delete('steam-selected-friends');
    if (username.length < 1) {
      LocalStorage.delete('steam-username');
    } else {
      LocalStorage.set('steam-username', username)
    }
  }

  return (
    <div className="App">
      {username.length > 0 ? (
        <SteamUserPage />
      ) : (
        <SteamLookupPage onUsernameChange={onUsernameChange} />
      )}
    </div>
  );
}

export default App;
