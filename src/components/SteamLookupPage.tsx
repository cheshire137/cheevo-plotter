import React, { useState, useEffect } from 'react';
import LocalStorage from '../stores/LocalStorage';
import SteamApi from '../models/SteamApi';

const title = 'Find Steam User';

const SteamLookupPage = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    LocalStorage.delete('steam-id');
    LocalStorage.delete('steam-games');
    LocalStorage.delete('steam-selected-friends');
    if (username.length < 1) {
      LocalStorage.delete('steam-username');
    }
  }, [username])

  const onFormSubmit = (event) => {
    event.preventDefault()
  }

  const onUsernameChange = (event) => {
    setUsername(event.target.value.trim())
  }

  return (
    <div>
      <div>
        <h1>{title}</h1>
        <form onSubmit={onFormSubmit}>
          <label htmlFor="steam-username">
            Steam user name:
          </label>
          <input type="text" value={username} id="steam-username" autoFocus={true} 
            placeholder="e.g., cheshire137" onChange={onUsernameChange} />
          <p>
            The Steam profile must be public.
          </p>
        </form>
      </div>
    </div>
  );
}

export default SteamLookupPage;
