import React, { useState } from 'react'

interface Props {
  onUsernameChange(newUsername: string): void;
}

const SteamLookupPage = ({ onUsernameChange }: Props) => {
  const [username, setUsername] = useState("")

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onUsernameChange(username)
  }

  return <div>
    <h1>Find Steam user</h1>
    <form onSubmit={e => onSubmit(e)}>
      <label htmlFor="steam-username">Steam user name:</label>
      <input type="text" value={username} id="steam-username" autoFocus={true}
        placeholder="e.g., cheshire137" onChange={e => setUsername(e.target.value.trim())} />
      <p>The Steam profile must be public.</p>
    </form>
  </div>
}

export default SteamLookupPage;
