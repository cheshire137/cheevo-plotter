import React, { useState } from 'react'
import { backendUrl } from '../models/SteamApi'
import { Button, PageLayout, FormControl, Link, TextInput, Text } from '@primer/react'

interface Props {
  onUsernameChange(newUsername: string): void;
}

const SteamLookupPage = ({ onUsernameChange }: Props) => {
  const [username, setUsername] = useState("")

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onUsernameChange(username)
  }

  return <PageLayout>
    <PageLayout.Header>
      <h1>Find Steam user</h1>
    </PageLayout.Header>
    <PageLayout.Content>
      <form onSubmit={e => onSubmit(e)}>
        <FormControl required={true} id="steam-username">
          <FormControl.Label>Steam user name:</FormControl.Label>
          <TextInput value={username} autoFocus={true} autoComplete="off"
            placeholder="e.g., cheshire137" onChange={e => setUsername(e.target.value.trim())} />
          <Text as="p" fontSize="1" color="fg.subtle">The Steam profile must be public.</Text>
        </FormControl>
        <Button
          type="submit"
        >Find user</Button>
      </form>
      <p>
        Or <Link href={`${backendUrl}/auth/steam`}>Sign in with Steam</Link>
      </p>
    </PageLayout.Content>
  </PageLayout>
}

export default SteamLookupPage;
