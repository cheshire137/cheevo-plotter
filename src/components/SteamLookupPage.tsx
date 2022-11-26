import React, { useState } from 'react';
import LocalStorage from '../stores/LocalStorage';

const title = 'Find Steam User';

interface Props {
  onUsernameChange(newUsername: string): void;
}

const SteamLookupPage = (props: Props) => {
  const [username, setUsername] = useState("");

  const onUsernameChange = (newUsername: string) => {
    setUsername(newUsername)
    props.onUsernameChange(newUsername)
  }

  return (
    <div>
      <div>
        <h1>{title}</h1>
        <form onSubmit={e => e.preventDefault()}>
          <label htmlFor="steam-username">
            Steam user name:
          </label>
          <input type="text" value={username} id="steam-username" autoFocus={true} 
            placeholder="e.g., cheshire137" onChange={e => onUsernameChange(e.target.value.trim())} />
          <p>
            The Steam profile must be public.
          </p>
        </form>
      </div>
    </div>
  );
}

export default SteamLookupPage;
